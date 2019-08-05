Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const context = {}
const whereaboutsApi = {}
const {
  updateAttendance,
  getAbsenceReasons,
  batchUpdateAttendance,
} = require('../controllers/attendance').attendanceFactory(whereaboutsApi)

describe('Attendence and Pay controller', async () => {
  const attendenceDetails = {
    offenderNo: 'ABC123',
    bookingId: 1,
    period: 'AM',
    prisonId: 'LEI',
    eventId: 45,
    eventLocationId: 1,
    attended: true,
    paid: true,
  }

  describe('updateAttendance', () => {
    it('should throw an error when offenderNo is null', async done => {
      try {
        await updateAttendance(context)
      } catch (e) {
        expect(e).toEqual(new Error('Booking ID is missing'))
        done()
      }
    })

    beforeEach(() => {
      whereaboutsApi.postAttendance = jest.fn()
      whereaboutsApi.putAttendance = jest.fn()
    })

    it('should postAttendance when there is no attendance ID', async () => {
      await updateAttendance(context, {
        eventDate: '10/10/2019',
        ...attendenceDetails,
      })

      expect(whereaboutsApi.postAttendance).toHaveBeenCalledWith(context, {
        eventDate: '2019-10-10',
        ...attendenceDetails,
      })
    })

    it('should call putAttendance when there is an attendance ID', async () => {
      const id = 1

      await updateAttendance(context, {
        id,
        eventDate: '10/10/2019',
        ...attendenceDetails,
      })

      expect(whereaboutsApi.putAttendance).toHaveBeenCalledWith(
        context,
        {
          eventDate: '2019-10-10',
          ...attendenceDetails,
        },
        id
      )
    })
  })

  describe('getAbsenceReasons', () => {
    beforeEach(() => {
      whereaboutsApi.getAbsenceReasons = jest.fn()
      whereaboutsApi.getAbsenceReasons.mockReturnValue({
        paidReasons: ['AcceptableAbsence', 'RestInCell', 'ApprovedCourse'],
        unpaidReasons: ['Refused', 'UnacceptableAbsence'],
        triggersIEPWarning: ['UnacceptableAbsence', 'Refused'],
      })
    })

    it('should call getAbsenceReasons and return formatted array of options alphabetically', async () => {
      const response = await getAbsenceReasons(context)

      expect(response).toEqual({
        paidReasons: [
          { name: 'Approved course', value: 'ApprovedCourse' },
          { name: 'Acceptable', value: 'AcceptableAbsence' },
          { name: 'Rest in cell', value: 'RestInCell' },
        ],
        unpaidReasons: [
          { name: 'Refused - IEP', value: 'Refused' },
          { name: 'Unacceptable - IEP', value: 'UnacceptableAbsence' },
        ],
        triggersIEPWarning: ['UnacceptableAbsence', 'Refused'],
      })
    })
  })

  describe('batchUpdateAttendance', () => {
    beforeEach(() => {
      whereaboutsApi.attendAll = jest.fn()
    })

    const offenders = [
      {
        offenderNo: 123,
        bookingId: 1,
        eventId: 123,
        eventLocationId: 123,
        attended: true,
        paid: true,
        period: 'AM',
        prisonId: 'LEI',
        eventDate: '29/06/2019',
      },
      {
        offenderNo: 345,
        bookingId: 2,
        eventId: 123,
        eventLocationId: 123,
        attended: true,
        paid: true,
        period: 'AM',
        prisonId: 'LEI',
        eventDate: '29/06/2019',
      },
      {
        offenderNo: 678,
        bookingId: 3,
        eventId: 123,
        eventLocationId: 123,
        attended: true,
        paid: true,
        period: 'AM',
        prisonId: 'LEI',
        eventDate: '29/06/2019',
      },
    ]

    it('should call attendAll with list of valid offenders', async () => {
      await batchUpdateAttendance(context, { offenders })
      expect(whereaboutsApi.attendAll).toHaveBeenCalledTimes(1)
      expect(whereaboutsApi.attendAll.mock.calls[0]).toEqual([
        context,
        {
          bookingActivities: [
            {
              activityId: 123,
              bookingId: 1,
            },
            {
              activityId: 123,
              bookingId: 2,
            },
            {
              activityId: 123,
              bookingId: 3,
            },
          ],
          eventDate: '2019-06-29',
          eventLocationId: 123,
          period: 'AM',
          prisonId: 'LEI',
        },
      ])
    })
  })
})
