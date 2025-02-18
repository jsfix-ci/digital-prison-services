import prisonerChangeIncentiveLevelDetails from '../controllers/prisonerProfile/prisonerChangeIncentiveLevelDetails'
import { raiseAnalyticsEvent } from '../raiseAnalyticsEvent'

jest.mock('../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

describe('Prisoner change incentive level details', () => {
  const offenderNo = 'ABC123'
  const bookingId = '123'
  const prisonApi = {}
  const incentivesApi = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
    }
    res = { locals: { user: { allCaseloads: [] } }, render: jest.fn(), redirect: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest
      .fn()
      .mockResolvedValue({ agencyId: 'MDI', bookingId, firstName: 'John', lastName: 'Smith' })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummaryForBooking' does not exist ... Remove this comment to see the full error message
    incentivesApi.getIepSummaryForBooking = jest.fn().mockReturnValue({
      bookingId: -1,
      iepDate: '2017-08-15',
      iepTime: '2017-08-15T16:04:35',
      iepLevel: 'Standard',
      daysSinceReview: 625,
      iepDetails: [
        {
          bookingId: -1,
          iepDate: '2017-08-15',
          iepTime: '2017-08-15T16:04:35',
          agencyId: 'LEI',
          iepLevel: 'Standard',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-10',
          iepTime: '2017-08-10T16:04:35',
          agencyId: 'HEI',
          iepLevel: 'Basic',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-07',
          iepTime: '2017-08-07T16:04:35',
          agencyId: 'HEI',
          iepLevel: 'Enhanced',
          userId: 'ITAG_USER',
        },
      ],
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyIepLevels' does not exist on ty... Remove this comment to see the full error message
    incentivesApi.getAgencyIepLevels = jest.fn().mockReturnValue([
      { iepLevel: 'ENT', iepDescription: 'Entry' },
      { iepLevel: 'BAS', iepDescription: 'Basic' },
      { iepLevel: 'STD', iepDescription: 'Standard' },
      { iepLevel: 'ENH', iepDescription: 'Enhanced' },
    ])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'changeIepLevel' does not exist on type '... Remove this comment to see the full error message
    incentivesApi.changeIepLevel = jest.fn()

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; logError: any; ... Remove this comment to see the full error message
    controller = prisonerChangeIncentiveLevelDetails({ prisonApi, incentivesApi, logError })
  })

  describe('index', () => {
    describe('when there are no errors', () => {
      it('should make the correct calls for information and render the correct template', async () => {
        await controller.index(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
        expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIepSummaryForBooking' does not exist ... Remove this comment to see the full error message
        expect(incentivesApi.getIepSummaryForBooking).toHaveBeenCalledWith(res.locals, bookingId, true)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyIepLevels' does not exist on ty... Remove this comment to see the full error message
        expect(incentivesApi.getAgencyIepLevels).toHaveBeenCalledWith(res.locals, 'MDI')
        expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerChangeIncentiveLevelDetails.njk', {
          agencyId: 'MDI',
          bookingId: '123',
          breadcrumbPrisonerName: 'Smith, John',
          formValues: {},
          iepLevel: 'Standard',
          offenderNo: 'ABC123',
          prisonerName: 'John Smith',
          profileUrl: '/prisoner/ABC123',
          selectableLevels: [
            {
              checked: false,
              text: 'Entry',
              value: 'ENT',
            },
            {
              checked: false,
              text: 'Basic',
              value: 'BAS',
            },
            {
              checked: false,
              text: 'Standard',
              value: 'STD',
            },
            {
              checked: false,
              text: 'Enhanced',
              value: 'ENH',
            },
          ],
        })
      })
    })

    describe('when there are API errors', () => {
      const error = new Error('Network error')
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
        prisonApi.getDetails.mockImplementation(() => Promise.reject(error))
      })

      it('should render the error template', async () => {
        await expect(controller.index(req, res)).rejects.toThrowError(error)
        expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
      })
    })
  })

  describe('post', () => {
    describe('when there are no errors', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'changeIepLevel' does not exist on type '... Remove this comment to see the full error message
        incentivesApi.changeIepLevel = jest.fn().mockReturnValue('All good')
      })

      it('should submit the appointment with the correct details and redirect', async () => {
        req.body = {
          agencyId: 'MDI',
          bookingId,
          iepLevel: 'Standard',
          newIepLevel: 'Enhanced',
          reason: 'A reason why it has changed',
        }

        await controller.post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'changeIepLevel' does not exist on type '... Remove this comment to see the full error message
        expect(incentivesApi.changeIepLevel).toHaveBeenCalledWith(res.locals, bookingId, {
          iepLevel: 'Enhanced',
          comment: 'A reason why it has changed',
        })
        expect(raiseAnalyticsEvent).toBeCalledWith(
          'Update Incentive level',
          'Level changed from Standard to Enhanced at MDI',
          'Incentive level change'
        )
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${offenderNo}/incentive-level-details`)
      })
    })

    describe('when there are form errors', () => {
      it('should re render the template and return the errors', async () => {
        req.body = {}

        await controller.post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'changeIepLevel' does not exist on type '... Remove this comment to see the full error message
        expect(incentivesApi.changeIepLevel).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerChangeIncentiveLevelDetails.njk', {
          agencyId: 'MDI',
          bookingId: '123',
          breadcrumbPrisonerName: 'Smith, John',
          errors: [
            {
              href: '#newIepLevel',
              text: 'Select an incentive level',
            },
            {
              href: '#reason',
              text: 'Enter a reason for your selected incentive label',
            },
          ],
          formValues: {},
          iepLevel: 'Standard',
          offenderNo: 'ABC123',
          prisonerName: 'John Smith',
          profileUrl: '/prisoner/ABC123',
          selectableLevels: [
            {
              checked: false,
              text: 'Entry',
              value: 'ENT',
            },
            {
              checked: false,
              text: 'Basic',
              value: 'BAS',
            },
            {
              checked: false,
              text: 'Standard',
              value: 'STD',
            },
            {
              checked: false,
              text: 'Enhanced',
              value: 'ENH',
            },
          ],
        })
      })

      it('should retain inputted form values', async () => {
        req.body = { reason: 'A reason why it has changed' }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerChangeIncentiveLevelDetails.njk',
          expect.objectContaining({
            errors: [
              {
                href: '#newIepLevel',
                text: 'Select an incentive level',
              },
            ],
            formValues: { reason: 'A reason why it has changed' },
          })
        )
      })
    })

    describe('when there are API errors', () => {
      it('should render the error template', async () => {
        req.body = { newIepLevel: 'Enhanced', reason: 'A reason why it has changed', bookingId }
        const error = new Error('Network error')

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'changeIepLevel' does not exist on type '... Remove this comment to see the full error message
        incentivesApi.changeIepLevel.mockRejectedValue(error)

        await expect(controller.post(req, res)).rejects.toThrowError(error)
      })
    })
  })
})
