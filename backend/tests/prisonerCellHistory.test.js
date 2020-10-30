const moment = require('moment')
const prisonerCellHistory = require('../controllers/prisonerProfile/prisonerCellHistory')

describe('Prisoner cell history', () => {
  const offenderNo = 'ABC123'
  const bookingId = '123'
  const prisonApi = {}
  const oauthApi = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    oauthApi.userRoles = jest.fn().mockResolvedValue([])
    prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith' })
    prisonApi.getOffenderCellHistory = jest.fn().mockResolvedValue({
      content: [
        {
          agencyId: 'MDI',
          assignmentDate: '2020-03-01',
          assignmentDateTime: '2020-03-01T12:48:33.375Z', // Avoid BST
          assignmentReason: 'ADM',
          bookingId,
          description: 'MDI-1-02',
          livingUnitId: 1,
        },
        {
          agencyId: 'RNI',
          assignmentDate: '2020-02-01',
          assignmentDateTime: '2020-02-01T12:48:33.375Z',
          assignmentEndDate: '2020-03-01',
          assignmentEndDateTime: '2020-03-01T12:48:33.375Z',
          assignmentReason: 'ADM',
          bookingId,
          description: 'RNI-1-03',
          livingUnitId: 3,
        },
      ],
    })
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue([])
    prisonApi.getInmatesAtLocation = jest.fn().mockResolvedValue([])

    controller = prisonerCellHistory({ oauthApi, prisonApi, logError })
  })

  it('should make the expected API calls', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonApi.getOffenderCellHistory).toHaveBeenCalledWith(res.locals, bookingId, { page: 0, size: 10000 })
    expect(prisonApi.getAgencyDetails.mock.calls.length).toBe(2)
    expect(prisonApi.getInmatesAtLocation).toHaveBeenCalledWith(res.locals, 1, {})
  })

  describe('cell history for offender', () => {
    beforeEach(() => {
      prisonApi.getAgencyDetails = jest
        .fn()
        .mockResolvedValueOnce({ agencyId: 'MDI', description: 'Moorland' })
        .mockResolvedValueOnce({ agencyId: 'RNI', description: 'Ranby' })
      prisonApi.getInmatesAtLocation.mockResolvedValue([
        { bookingId: '144', firstName: 'Another', lastName: 'Offender', offenderNo: 'B12345' },
      ])
    })

    it('sends the right data to the template', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerCellHistory.njk',
        expect.objectContaining({
          cellData: [
            {
              agencyId: 'RNI',
              assignmentDateTime: '2020-02-01T12:48:33',
              assignmentEndDateTime: '2020-03-01T12:48:33',
              establishment: 'Ranby',
              livingUnitId: 3,
              location: '1-03',
              movedIn: '01/02/2020 - 12:48',
              movedOut: '01/03/2020 - 12:48',
            },
          ],
          occupants: [
            {
              name: 'Offender, Another',
              profileUrl: '/prisoner/B12345',
            },
          ],
          currentLocation: {
            agencyId: 'MDI',
            assignmentDateTime: '2020-03-01T12:48:33',
            assignmentEndDateTime: moment().format('YYYY-MM-DDTHH:mm:ss'),
            establishment: 'Moorland',
            livingUnitId: 1,
            location: '1-02',
            movedIn: '01/03/2020 - 12:48',
          },
          canViewCellMoveButton: false,
          prisonerName: 'John Smith',
        })
      )
    })

    it('sets the cell move correctly if role exists', async () => {
      oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'CELL_MOVE' }])
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerCellHistory.njk',
        expect.objectContaining({
          canViewCellMoveButton: true,
        })
      )
    })
  })
})
