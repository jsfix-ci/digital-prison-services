import attendanceChangeRouter from '../routes/attendanceChangesRouter'

describe('Attendance change router', () => {
  const res = {
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn(),
  }

  const whereaboutsApi = {
    getAttendanceChanges: jest.fn(),
  }
  const prisonApi = {
    getScheduledActivities: jest.fn(),
    getUserDetailsList: jest.fn(),
  }

  let req
  let router

  beforeEach(() => {
    whereaboutsApi.getAttendanceChanges.mockReturnValue({ changes: [] })
    prisonApi.getScheduledActivities.mockReturnValue([])
    prisonApi.getUserDetailsList.mockReturnValue([
      {
        username: 'username1',
        firstName: 'First name',
        lastName: 'Last name',
      },
    ])
    router = attendanceChangeRouter({ prisonApi, whereaboutsApi })

    req = {
      originalUrl: 'http://localhost',
      query: {
        agencyId: 'MDI',
        fromDateTime: '2020-10-03T00:00',
        toDateTime: '2020-10-03T12:00',
        subHeading: '3 November 2020 - AM + PM',
      },
    }
  })

  it('should request changes for a given date time range', async () => {
    await router(req, res)

    expect(whereaboutsApi.getAttendanceChanges).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        fromDateTime: '2020-10-03T00:00',
        toDateTime: '2020-10-03T12:00',
      })
    )
  })

  it('should make a request for scheduled activity that has been changed', async () => {
    whereaboutsApi.getAttendanceChanges.mockReturnValue({
      changes: [{ eventId: 1 }, { eventId: 1 }, { eventId: 2 }],
    })

    await router(req, res)

    expect(prisonApi.getScheduledActivities).toHaveBeenCalledWith({}, { agencyId: 'MDI', eventIds: [1, 2] })
  })

  it('should make a request to get user details', async () => {
    whereaboutsApi.getAttendanceChanges.mockReturnValue({
      changes: [
        { eventId: 1, changedBy: 'username1', prisonId: 'MDI' },
        { eventId: 2, changedBy: 'username2', prisonId: 'MDI' },
        { eventId: 3, changedBy: 'username2', prisonId: 'MDI' },
      ],
    })

    await router(req, res)

    expect(prisonApi.getUserDetailsList).toHaveBeenCalledWith({}, ['username1', 'username2'])
  })

  it('should return table rows in the right order and format', async () => {
    whereaboutsApi.getAttendanceChanges.mockReturnValue({
      changes: [
        {
          eventId: 1,
          changedBy: 'username',
          changedFrom: 'Refused',
          changedTo: 'Attended',
          changedOn: '2020-10-02T17:00',
          prisonId: 'MDI',
        },
        {
          eventId: 2,
          changedBy: 'username',
          changedFrom: 'AcceptableAbsence',
          changedTo: 'Refused',
          changedOn: '2020-10-02T11:00',
          prisonId: 'MDI',
        },
      ],
    })

    prisonApi.getScheduledActivities.mockReturnValue([
      { eventId: 1, firstName: 'first name 1', lastName: 'last name', comment: 'Wood work', offenderNo: 'A123456' },
      { eventId: 2, firstName: 'first name 2', lastName: 'last name', comment: 'Kitchen', offenderNo: 'A23457' },
    ])

    prisonApi.getUserDetailsList.mockReturnValue([
      {
        firstName: 'Peter',
        lastName: 'Parker',
        username: 'username',
      },
    ])

    await router(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'attendanceChanges.njk',
      expect.objectContaining({
        subHeading: '3 November 2020 - AM + PM',
        attendanceChanges: [
          [
            {
              attributes: { 'data-sort-value': 'last name' },
              html: '<a href="/prisoner/A23457" class="govuk-link">Last name, First name 2</a>',
            },
            { text: 'A23457' },
            { text: 'Kitchen' },
            { text: 'Acceptable absence' },
            { text: 'Refused' },
            { attributes: { 'data-sort-value': expect.any(Number) }, text: '2 October 2020 - 11:00' },
            { text: 'Peter Parker' },
          ],
          [
            {
              attributes: { 'data-sort-value': 'last name' },
              html: '<a href="/prisoner/A123456" class="govuk-link">Last name, First name 1</a>',
            },
            { text: 'A123456' },
            { text: 'Wood work' },
            { text: 'Refused' },
            { text: 'Attended' },
            { attributes: { 'data-sort-value': expect.any(Number) }, text: '2 October 2020 - 17:00' },
            { text: 'Peter Parker' },
          ],
        ],
      })
    )
  })

  it('should redirect back to the attendance dashboard when any query parameters are missing', async () => {
    req.query = {}
    await router(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/manage-prisoner-whereabouts/attendance-reason-statistics')
  })

  it('should render page when there are no changes', async () => {
    res.redirect = jest.fn()
    await router(req, res)
    expect(res.redirect).toHaveBeenCalledTimes(0)
    expect(res.render).toHaveBeenCalledWith(
      'attendanceChanges.njk',
      expect.objectContaining({
        attendanceChanges: [],
        subHeading: '3 November 2020 - AM + PM',
      })
    )
  })

  it('should only show changes from the requested agency', async () => {
    whereaboutsApi.getAttendanceChanges.mockReturnValue({
      changes: [
        {
          eventId: 1,
          prisonId: 'LEI',
          changedBy: 'username',
          changedFrom: 'Refused',
          changedTo: 'Attended',
          changedOn: '2020-10-02T17:00',
        },
        {
          eventId: 2,
          prisonId: 'MDI',
          changedBy: 'username',
          changedFrom: 'AcceptableAbsence',
          changedTo: 'Refused',
          changedOn: '2020-10-02T11:00',
        },
      ],
    })

    prisonApi.getScheduledActivities.mockReturnValue([
      { eventId: 1, firstName: 'first name 1', lastName: 'last name', comment: 'Wood work', offenderNo: 'A123456' },
      { eventId: 2, firstName: 'first name 2', lastName: 'last name', comment: 'Kitchen', offenderNo: 'A23457' },
    ])

    prisonApi.getUserDetailsList.mockReturnValue([{ firstName: 'Steve', lastName: 'Walsh', username: 'username' }])

    await router(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'attendanceChanges.njk',
      expect.objectContaining({
        subHeading: '3 November 2020 - AM + PM',
        attendanceChanges: [
          [
            {
              attributes: { 'data-sort-value': 'last name' },
              html: '<a href="/prisoner/A23457" class="govuk-link">Last name, First name 2</a>',
            },
            { text: 'A23457' },
            { text: 'Kitchen' },
            { text: 'Acceptable absence' },
            { text: 'Refused' },
            { attributes: { 'data-sort-value': expect.any(Number) }, text: '2 October 2020 - 11:00' },
            { text: 'Steve Walsh' },
          ],
        ],
      })
    )
  })
})
