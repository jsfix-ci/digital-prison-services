import prisonerPersonal from '../controllers/prisonerProfile/prisonerPersonal'
import config from '../config'
import {
  NeurodivergenceSelfDeclared,
  NeurodivergenceAssessed,
  NeurodivergenceSupport,
} from '../api/curious/types/Enums'

config.app.neurodiversityEnabledPrisons = ['NOT-ACCELERATED']

describe('prisoner personal', () => {
  const offenderNo = 'ABC123'
  const prisonerProfileData = {
    activeAlertCount: 1,
    agencyName: 'Moorland Closed',
    alerts: [],
    category: 'Cat C',
    csra: 'High',
    inactiveAlertCount: 2,
    incentiveLevel: 'Standard',
    keyWorkerLastSession: '07/04/2020',
    keyWorkerName: 'Member, Staff',
    location: 'CELL-123',
    offenderName: 'Prisoner, Test',
    offenderNo,
    interpreterRequired: true,
    language: 'English',
    writtenLanguage: 'Russian',
  }
  const bookingId = '123'
  const prisonApi = {}
  const allocationManagerApi = {}
  const prisonerProfileService = {}
  const personService = {}
  const esweService = {}
  const systemOauthClient = {}
  const restrictedPatientApi = {}
  const oauthApi = {}
  const curiousApi = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = { params: { offenderNo }, session: { userDetails: { username: 'ITAG_USER' } } }
    res = {
      locals: {
        user: { activeCaseLoad: { caseLoadId: 'MDI' } },
      },
      render: jest.fn(),
    }
    config.app.neurodiversityEnabledUsernames = 'ITAG_USER'

    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
    personService.getPersonContactDetails = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not ex... Remove this comment to see the full error message
    esweService.getNeurodiversities = jest.fn().mockResolvedValue('')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not ex... Remove this comment to see the full error message
    esweService.getNeurodivergence = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getLearnerNeurodivergence' does not ex... Remove this comment to see the full error message
    curiousApi.getLearnerNeurodivergence = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIdentifiers' does not exist on type '... Remove this comment to see the full error message
    prisonApi.getIdentifiers = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderAliases' does not exist on ty... Remove this comment to see the full error message
    prisonApi.getOffenderAliases = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProperty' does not exist on t... Remove this comment to see the full error message
    prisonApi.getPrisonerProperty = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerContacts' does not exist on t... Remove this comment to see the full error message
    prisonApi.getPrisonerContacts = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerAddresses' does not exist on ... Remove this comment to see the full error message
    prisonApi.getPrisonerAddresses = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSecondaryLanguages' does not exist on... Remove this comment to see the full error message
    prisonApi.getSecondaryLanguages = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonalCareNeeds' does not exist on ... Remove this comment to see the full error message
    prisonApi.getPersonalCareNeeds = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getReasonableAdjustments' does not exist... Remove this comment to see the full error message
    prisonApi.getReasonableAdjustments = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getTreatmentTypes' does not exist on typ... Remove this comment to see the full error message
    prisonApi.getTreatmentTypes = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHealthTypes' does not exist on type '... Remove this comment to see the full error message
    prisonApi.getHealthTypes = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencies' does not exist on type '{}'... Remove this comment to see the full error message
    prisonApi.getAgencies = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
    allocationManagerApi.getPomByOffenderNo = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not exist on type '{}'... Remove this comment to see the full error message
    esweService.getNeurodiversities = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.userRoles = jest.fn().mockReturnValue([])

    controller = prisonerPersonal({
      prisonerProfileService,
      personService,
      prisonApi,
      allocationManagerApi,
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonerProfileService: {}; pe... Remove this comment to see the full error message
      logError,
      esweService,
      restrictedPatientApi,
      systemOauthClient,
      oauthApi,
      curiousApi,
    })
  })

  it('should make a call for the basic details of a prisoner and the prisoner header details and render them', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(
      res.locals,
      offenderNo,
      'ITAG_USER',
      false
    )
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
      expect.objectContaining({
        prisonerProfileData,
      })
    )
  })

  it('should make a call to request the prisoners secondary languages', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockResolvedValue({ bookingId: 123 })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSecondaryLanguages' does not exist on... Remove this comment to see the full error message
    prisonApi.getSecondaryLanguages.mockResolvedValue([
      {
        bookingId: 10000,
        canRead: true,
        canSpeak: true,
        canWrite: true,
        code: 'ENG',
        description: 'English',
      },
    ])
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSecondaryLanguages' does not exist on... Remove this comment to see the full error message
    expect(prisonApi.getSecondaryLanguages).toHaveBeenCalledWith(res.locals, 123)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
      expect.objectContaining({
        languages: {
          interpreterRequired: true,
          language: 'English',
          noPreferredLanguageEntered: false,
          secondaryLanguages: [
            { key: { classes: 'govuk-summary-list__key--indent', text: 'English' }, value: { text: null } },
          ],
          speaksAndWritesDifferentPreferredLanguages: true,
          speaksAndWritesSamePreferredLanguage: false,
          speaksOnlyInPreferredLanguage: false,
          writesOnlyInPreferredLanguage: false,
          writtenLanguage: 'Russian',
        },
      })
    )
  })

  describe('identifiers', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockResolvedValue({ bookingId })
    })

    it('should make a call for identifiers data', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIdentifiers' does not exist on type '... Remove this comment to see the full error message
      expect(prisonApi.getIdentifiers).toHaveBeenCalledWith(res.locals, bookingId)
    })

    describe('when there is missing identifier data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            identifiers: [{ label: 'PNC number', value: undefined }],
          })
        )
      })
    })

    describe('when there is identifier data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIdentifiers' does not exist on type '... Remove this comment to see the full error message
        prisonApi.getIdentifiers = jest.fn().mockResolvedValue([
          { type: 'PNC', value: '1234' },
          { type: 'CRO', value: '2345' },
          { type: 'NINO', value: '3456' },
          { type: 'HOREF', value: '4567' },
          { type: 'DL', value: '5678' },
        ])
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            identifiers: [
              { label: 'PNC number', value: '1234' },
              { label: 'CRO number', value: '2345' },
              { label: 'National insurance number', value: '3456' },
              { label: 'Home office reference number', value: '4567' },
              { label: 'Driving licence number', value: '5678' },
            ],
          })
        )
      })
    })
  })

  describe('aliases', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockResolvedValue({ bookingId })
    })

    it('should make a call for aliases data', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderAliases' does not exist on ty... Remove this comment to see the full error message
      expect(prisonApi.getOffenderAliases).toHaveBeenCalledWith(res.locals, bookingId)
    })

    describe('when there is missing aliases data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            aliases: [],
          })
        )
      })
    })

    describe('when there is aliases data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderAliases' does not exist on ty... Remove this comment to see the full error message
        prisonApi.getOffenderAliases = jest.fn().mockResolvedValue([
          { firstName: 'First', lastName: 'Alias', dob: '1985-08-31' },
          { firstName: 'Second', lastName: 'Alias', dob: '1986-05-20' },
        ])
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            aliases: [
              { label: 'Alias, First', value: '31/08/1985' },
              { label: 'Alias, Second', value: '20/05/1986' },
            ],
          })
        )
      })
    })
  })

  describe('physical characteristics', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockResolvedValue({ bookingId })
    })

    describe('when there is missing physical characteristic data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            physicalCharacteristics: [
              { label: 'Height', value: undefined },
              { label: 'Weight', value: undefined },
              { label: 'Hair colour', value: undefined },
              { label: 'Left eye colour', value: undefined },
              { label: 'Right eye colour', value: undefined },
              { label: 'Facial hair', value: undefined },
              { label: 'Shape of face', value: undefined },
              { label: 'Build', value: undefined },
              { label: 'Shoe size', value: undefined },
            ],
          })
        )
      })
    })

    describe('when there is physical characteristic data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
        prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
          ...prisonerProfileData,
          physicalAttributes: {
            heightMetres: 1.91,
            weightKilograms: 86,
          },
          physicalCharacteristics: [
            { type: 'HAIR', detail: 'Brown' },
            { type: 'R_EYE_C', detail: 'Green' },
            { type: 'L_EYE_C', detail: 'Blue' },
            { type: 'FACIAL_HAIR', detail: 'Moustache' },
            { type: 'FACE', detail: 'Round' },
            { type: 'BUILD', detail: 'Athletic' },
            { type: 'SHOESIZE', detail: '12' },
          ],
        })
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            physicalCharacteristics: [
              { label: 'Height', value: '1.91m' },
              { label: 'Weight', value: '86kg' },
              { label: 'Hair colour', value: 'Brown' },
              { label: 'Left eye colour', value: 'Blue' },
              { label: 'Right eye colour', value: 'Green' },
              { label: 'Facial hair', value: 'Moustache' },
              { label: 'Shape of face', value: 'Round' },
              { label: 'Build', value: 'Athletic' },
              { label: 'Shoe size', value: '12' },
            ],
          })
        )
      })
    })
  })

  describe('distinguishing physical marks', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockResolvedValue({ bookingId })
    })

    describe('when there is missing distinguishing physical marks data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            distinguishingMarks: undefined,
          })
        )
      })
    })

    describe('when there is distinguishing physical marks data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
        prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
          ...prisonerProfileData,
          physicalMarks: [
            { type: 'Tattoo', side: 'Left', bodyPart: 'Arm', comment: 'Childs name', orentiation: 'Facing up' },
            {
              type: 'Tattoo',
              side: 'Right',
              bodyPart: 'Arm',
              comment: 'Face',
              orentiation: 'Facing down',
              imageId: 123,
            },
          ],
        })
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            distinguishingMarks: [
              {
                details: [
                  { label: 'Body part', value: 'Arm' },
                  { label: 'Side', value: 'Left' },
                  { label: 'Orientation', value: 'Facing up' },
                  { label: 'Comment', value: 'Childs name' },
                ],
                label: 'Tattoo',
              },
              {
                details: [
                  { label: 'Body part', value: 'Arm' },
                  { label: 'Side', value: 'Right' },
                  { label: 'Orientation', value: 'Facing down' },
                  { label: 'Comment', value: 'Face' },
                ],
                label: 'Tattoo',
                imageId: 123,
              },
            ],
          })
        )
      })
    })
  })

  describe('personal details section', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockResolvedValue({ bookingId })
    })

    describe('primary', () => {
      describe('when there is missing primary data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                primary: [
                  { label: 'Age', value: undefined },
                  { label: 'Date of Birth', value: undefined },
                  { label: 'Place of Birth', value: undefined },
                  { label: 'Sex', value: undefined },
                  { label: 'Ethnicity', value: undefined },
                  { label: 'Religion or belief', value: undefined },
                  { label: 'Nationality', value: undefined },
                ],
              }),
            })
          )
        })
      })

      describe('when there is primary data', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
          prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
            ...prisonerProfileData,
            dateOfBirth: '1990-10-12',
            age: 29,
            birthPlace: 'DONCASTER',
            physicalAttributes: {
              gender: 'Male',
              ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
              raceCode: 'W1',
            },
            profileInformation: [
              { type: 'RELF', resultValue: 'Christian' },
              { type: 'NAT', resultValue: 'British' },
            ],
          })
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                primary: [
                  { label: 'Age', value: 29 },
                  { label: 'Date of Birth', value: '12/10/1990' },
                  { label: 'Place of Birth', value: 'Doncaster' },
                  { label: 'Sex', value: 'Male' },
                  { label: 'Ethnicity', value: 'White: Eng./Welsh/Scot./N.Irish/British (W1)' },
                  { label: 'Religion or belief', value: 'Christian' },
                  { label: 'Nationality', value: 'British' },
                ],
              }),
            })
          )
        })
      })
    })

    describe('secondary', () => {
      describe('when there is missing secondary data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                secondary: [
                  { label: 'Sexual orientation', value: undefined },
                  { label: 'Marital status', value: undefined },
                  { label: 'Number of children', value: undefined },
                  { label: 'Smoker or vaper', value: undefined },
                ],
              }),
            })
          )
        })
      })

      describe('when there is secondary data', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
          prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
            ...prisonerProfileData,
            profileInformation: [
              { type: 'SEXO', resultValue: 'Hetrosexual' },
              { type: 'MARITAL', resultValue: 'Single-not married/in civil partnership' },
              { type: 'CHILD', resultValue: 2 },
              { type: 'SMOKE', resultValue: 'Yes' },
              { type: 'DIET', resultValue: 'Religion - Muslim' },
            ],
          })
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                secondary: [
                  { label: 'Sexual orientation', value: 'Hetrosexual' },
                  { label: 'Marital status', value: 'Single-not married/in civil partnership' },
                  { label: 'Number of children', value: 2 },
                  { label: 'Smoker or vaper', value: 'Yes' },
                  { label: 'Type of diet', value: 'Religion - Muslim' },
                ],
              }),
            })
          )
        })
      })
    })

    describe('tertiary', () => {
      describe('when there is missing tertiary data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                tertiary: [{ label: 'Interest to immigration', value: undefined }],
              }),
            })
          )
        })
      })

      describe('when there is tertiary data', () => {
        describe('when travel restrictions does not have a value and other values are No', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
            prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
              ...prisonerProfileData,
              profileInformation: [
                { type: 'IMM', resultValue: 'No' },
                { type: 'TRAVEL', resultValue: '' },
                { type: 'PERSC', resultValue: 'No' },
                { type: 'YOUTH', resultValue: 'No' },
                { type: 'DNA', resultValue: 'No' },
              ],
            })
          })

          it('should not display the other tertiary data items', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  tertiary: [{ label: 'Interest to immigration', value: 'No' }],
                }),
              })
            )
          })
        })

        describe('when travel restrictions does have a value and other values are Yes', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
            prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
              ...prisonerProfileData,
              profileInformation: [
                { type: 'IMM', resultValue: 'Yes' },
                { type: 'TRAVEL', resultValue: 'Cannot travel to Sheffield' },
                { type: 'PERSC', resultValue: 'Yes' },
                { type: 'YOUTH', resultValue: 'Yes' },
                { type: 'DNA', resultValue: 'Yes' },
              ],
            })
          })

          it('should display the other tertiary data items', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  tertiary: [
                    { label: 'Interest to immigration', value: 'Yes' },
                    { label: 'Travel restrictions', value: 'Cannot travel to Sheffield' },
                    { label: 'Social care needed', value: 'Yes' },
                    { label: 'Youth offender', value: 'Yes' },
                    { label: 'DNA required', value: 'Yes' },
                  ],
                }),
              })
            )
          })
        })
      })
    })

    describe('reception warnings', () => {
      describe('when there is missing reception warnings data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                receptionWarnings: [
                  { label: 'Warned about tattooing', value: 'Needs to be warned' },
                  { label: 'Warned not to change appearance', value: 'Needs to be warned' },
                ],
              }),
            })
          )
        })
      })

      describe('when the prisoner has been warned about tattooing and their appearance', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
          prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
            ...prisonerProfileData,
            profileInformation: [
              { type: 'TAT', resultValue: 'Yes' },
              { type: 'APPEAR', resultValue: 'Yes' },
            ],
          })
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                receptionWarnings: [
                  { label: 'Warned about tattooing', value: 'Yes' },
                  { label: 'Warned not to change appearance', value: 'Yes' },
                ],
              }),
            })
          )
        })
      })

      describe('when the prisoner has not been warned about tattooing and their appearance', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
          prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
            ...prisonerProfileData,
            profileInformation: [
              { type: 'TAT', resultValue: 'No' },
              { type: 'APPEAR', resultValue: 'No' },
            ],
          })
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                receptionWarnings: [
                  { label: 'Warned about tattooing', value: 'Needs to be warned' },
                  { label: 'Warned not to change appearance', value: 'Needs to be warned' },
                ],
              }),
            })
          )
        })
      })
    })

    describe('listener', () => {
      describe('when there is missing listener data', () => {
        it('should display nothing', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                listener: [],
              }),
            })
          )
        })
      })

      describe('listener suitable and recognised', () => {
        describe('when suitable is No and recognised is No', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
            prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
              ...prisonerProfileData,
              profileInformation: [
                { type: 'LIST_SUIT', resultValue: 'No' },
                { type: 'LIST_REC', resultValue: 'No' },
              ],
            })
          })

          it('should display nothing', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  listener: [],
                }),
              })
            )
          })
        })

        describe('when suitable is Yes and recognised is No', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
            prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
              ...prisonerProfileData,
              profileInformation: [
                { type: 'LIST_SUIT', resultValue: 'Yes' },
                { type: 'LIST_REC', resultValue: 'No' },
              ],
            })
          })

          it('should display both suitable and recognised', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  listener: [
                    { label: 'Listener - suitable', value: 'Yes' },
                    { label: 'Listener - recognised', value: 'No' },
                  ],
                }),
              })
            )
          })
        })

        describe('when suitable is Yes and recognised is Yes', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
            prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
              ...prisonerProfileData,
              profileInformation: [
                { type: 'LIST_SUIT', resultValue: 'Yes' },
                { type: 'LIST_REC', resultValue: 'Yes' },
              ],
            })
          })

          it('should display recognised only', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  listener: [{ label: 'Listener - recognised', value: 'Yes' }],
                }),
              })
            )
          })
        })

        describe('when suitable is Yes and recognised is empty', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
            prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
              ...prisonerProfileData,
              profileInformation: [{ type: 'LIST_SUIT', resultValue: 'Yes' }],
            })
          })

          it('should display suitable with value and recognised with no value', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  listener: [
                    { label: 'Listener - suitable', value: 'Yes' },
                    { label: 'Listener - recognised', value: undefined },
                  ],
                }),
              })
            )
          })
        })

        describe('when suitable is No and recognised is Yes', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
            prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
              ...prisonerProfileData,
              profileInformation: [
                { type: 'LIST_SUIT', resultValue: 'No' },
                { type: 'LIST_REC', resultValue: 'Yes' },
              ],
            })
          })

          it('should display nothing', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  listener: [],
                }),
              })
            )
          })
        })

        describe('when suitable has no value and recognised is Yes', () => {
          beforeEach(() => {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
            prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
              ...prisonerProfileData,
              profileInformation: [{ type: 'LIST_REC', resultValue: 'Yes' }],
            })
          })

          it('should display recognised only', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  listener: [{ label: 'Listener - recognised', value: 'Yes' }],
                }),
              })
            )
          })
        })
      })
    })

    describe('domestic abuse', () => {
      describe('when there is missing domestic abuse data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                domesticAbuse: [],
              }),
            })
          )
        })
      })

      describe('when the domestic abuse values are YES', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
          prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
            ...prisonerProfileData,
            profileInformation: [
              { type: 'DOMESTIC', resultValue: 'YES' },
              { type: 'DOMVIC', resultValue: 'YES' },
            ],
          })
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                domesticAbuse: [
                  { label: 'Domestic abuse perpetrator', value: 'Yes' },
                  { label: 'Domestic abuse victim', value: 'Yes' },
                ],
              }),
            })
          )
        })
      })

      describe('when the domestic abuse values are NO', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
          prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue({
            ...prisonerProfileData,
            profileInformation: [
              { type: 'DOMESTIC', resultValue: 'NO' },
              { type: 'DOMVIC', resultValue: 'NO' },
            ],
          })
        })

        it('should not render any domestic abuse related items', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                domesticAbuse: [],
              }),
            })
          )
        })
      })
    })

    describe('property', () => {
      describe('when there is missing property data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                property: [],
              }),
            })
          )
        })
      })

      describe('when there is property data', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProperty' does not exist on t... Remove this comment to see the full error message
          prisonApi.getPrisonerProperty.mockResolvedValue([
            {
              containerType: 'Valuables',
              location: { userDescription: 'Property Box 123' },
              sealMark: 123,
            },
            {
              containerType: 'Bulk',
              location: { userDescription: 'Property Box 456' },
              sealMark: 456,
            },
          ])
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                property: [
                  {
                    details: [
                      { label: 'Seal mark', value: 123 },
                      { label: 'Location', value: 'Property Box 123' },
                    ],
                    label: 'Property',
                    value: 'Valuables',
                  },
                  {
                    details: [
                      { label: 'Seal mark', value: 456 },
                      { label: 'Location', value: 'Property Box 456' },
                    ],
                    label: 'Property',
                    value: 'Bulk',
                  },
                ],
              }),
            })
          )
        })
      })
    })
  })

  describe('active contacts', () => {
    const primaryAddress = {
      addressType: 'HOME',
      flat: 'A',
      premise: '13',
      street: 'High Street',
      town: 'Ulverston',
      postalCode: 'LS1 AAA',
      county: 'West Yorkshire',
      country: 'England',
      comment: 'address comment field',
      primary: true,
      noFixedAddress: false,
      startDate: '2020-05-01',
      phones: [
        { number: '011111111111', type: 'MOB' },
        { number: '011333444', type: 'HOME', ext: '777' },
      ],
    }

    const nonPrimaryAddress = {
      addressType: 'HOME',
      flat: 'B',
      premise: '13',
      street: 'Another Street',
      town: 'Leeds',
      postalCode: 'LS2 BBB',
      county: 'West Yorkshire',
      country: 'England',
      comment: 'address comment field',
      primary: false,
      noFixedAddress: false,
      startDate: '2020-05-01',
      phones: [{ number: '011111111111', type: 'MOB' }],
    }

    const businessPrimary = {
      addressType: 'Business',
      flat: '222',
      premise: '999',
      street: 'Business street',
      town: 'London',
      postalCode: 'W1 ABC',
      county: 'London',
      country: 'England',
      comment: null,
      primary: false,
      noFixedAddress: false,
      startDate: '2020-05-01',
      endDate: null,
      phones: [],
      addressUsages: [],
    }

    const businessNonPrimary = {
      addressType: 'Business',
      flat: '222',
      premise: '000',
      street: 'Business street',
      town: 'Manchester',
      postalCode: 'W2 DEF',
      county: 'Greater Manchester',
      country: 'England',
      comment: null,
      primary: false,
      noFixedAddress: false,
      startDate: '2020-05-01',
      endDate: null,
      phones: [],
      addressUsages: [],
    }

    const homeNonPrimary = {
      addressType: 'Home',
      flat: '222',
      premise: '000',
      street: 'Business street',
      town: 'Manchester',
      postalCode: 'W2 DEF',
      county: 'Greater Manchester',
      country: 'England',
      comment: null,
      primary: false,
      noFixedAddress: false,
      startDate: '2020-05-01',
      endDate: null,
      phones: [],
      addressUsages: [],
    }

    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockResolvedValue({ bookingId })
    })

    it('should make a call for prisoners contacts data', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerContacts' does not exist on t... Remove this comment to see the full error message
      expect(prisonApi.getPrisonerContacts).toHaveBeenCalledWith(res.locals, bookingId)
    })

    it('should make a call for prison offender managers', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
      expect(allocationManagerApi.getPomByOffenderNo).toHaveBeenCalledWith(res.locals, offenderNo)
    })

    describe('when there is missing prisoner contacts data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({ personalContacts: undefined, professionalContacts: [] })
        )
      })
    })

    describe('when there is prisoner contacts data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerContacts' does not exist on t... Remove this comment to see the full error message
        prisonApi.getPrisonerContacts.mockResolvedValue({
          nextOfKin: [
            {
              lastName: 'SMITH',
              firstName: 'JOHN',
              contactType: 'S',
              contactTypeDescription: 'Social/Family',
              relationship: 'COU',
              relationshipDescription: 'Cousin',
              emergencyContact: true,
              nextOfKin: true,
              relationshipId: 1,
              personId: 12345,
              activeFlag: true,
              approvedVisitorFlag: false,
              canBeContactedFlag: false,
              awareOfChargesFlag: false,
              contactRootOffenderId: 0,
              bookingId,
            },
            {
              lastName: 'JONES',
              firstName: 'TERRY',
              contactType: 'S',
              contactTypeDescription: 'Social/Family',
              relationship: 'OTHER',
              relationshipDescription: 'Other - Social',
              emergencyContact: true,
              nextOfKin: true,
              relationshipId: 2,
              personId: 67890,
              activeFlag: false,
              approvedVisitorFlag: false,
              canBeContactedFlag: false,
              awareOfChargesFlag: false,
              contactRootOffenderId: 0,
              bookingId,
            },
          ],
          otherContacts: [
            {
              lastName: 'KIMBUR',
              firstName: 'ARENENG',
              contactType: 'O',
              contactTypeDescription: 'Official',
              relationship: 'PROB',
              relationshipDescription: 'Probation Officer',
              emergencyContact: false,
              nextOfKin: false,
              relationshipId: 6865390,
              personId: 111,
              activeFlag: true,
              approvedVisitorFlag: false,
              canBeContactedFlag: false,
              awareOfChargesFlag: false,
              contactRootOffenderId: 0,
              bookingId,
            },
            {
              lastName: 'SMITH',
              firstName: 'TREVOR',
              contactType: 'O',
              contactTypeDescription: 'Official',
              relationship: 'CA',
              relationshipDescription: 'Case Administrator',
              emergencyContact: false,
              nextOfKin: false,
              relationshipId: 7550160,
              personId: 333,
              activeFlag: true,
              approvedVisitorFlag: false,
              canBeContactedFlag: false,
              awareOfChargesFlag: false,
              contactRootOffenderId: 0,
              bookingId,
              createDateTime: '2019-01-01T12:00:00', // Previous Case Administrator
            },
            {
              lastName: 'LYDYLE',
              firstName: 'URIUALCHE',
              contactType: 'O',
              contactTypeDescription: 'Official',
              relationship: 'CA',
              relationshipDescription: 'Case Administrator',
              emergencyContact: false,
              nextOfKin: false,
              relationshipId: 7350143,
              personId: 222,
              activeFlag: true,
              approvedVisitorFlag: false,
              canBeContactedFlag: false,
              awareOfChargesFlag: false,
              contactRootOffenderId: 0,
              bookingId,
              createDateTime: '2020-01-01T12:00:00', // Current, most recently added Case Administrator
            },
          ],
        })
      })

      describe('when all possible data is available', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
          personService.getPersonContactDetails
            .mockResolvedValueOnce({
              addresses: [primaryAddress, nonPrimaryAddress],
              emails: [{ email: 'test1@email.com' }, { email: 'test2@email.com' }],
              phones: [
                { number: '02222222222', type: 'MOB' },
                { number: '033333333333', type: 'MOB', ext: '777' },
              ],
            })
            .mockResolvedValueOnce({
              addresses: [businessPrimary, businessNonPrimary],
              emails: [{ email: 'test3@email.com' }, { email: 'test4@email.com' }],
              phones: [
                { number: '04444444444', type: 'MOB' },
                { number: '055555555555', type: 'BUS', ext: '123' },
              ],
            })

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
          allocationManagerApi.getPomByOffenderNo.mockResolvedValue({
            primary_pom: { staffId: 1, name: 'SMITH, JANE' },
            secondary_pom: { staffId: 2, name: 'DOE, JOHN' },
          })
        })

        it('should make calls for contact details of active personal contacts and case administrators', async () => {
          await controller(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
          expect(personService.getPersonContactDetails.mock.calls.length).toBe(1)
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
          expect(personService.getPersonContactDetails).toHaveBeenCalledWith(res.locals, 12345)
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
          expect(personService.getPersonContactDetails).not.toHaveBeenCalledWith(res.locals, 67890)
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
          expect(personService.getPersonContactDetails).not.toHaveBeenCalledWith(res.locals, 111)
        })

        it('should render the template with the correct primary address data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalContacts: [
                {
                  name: 'John Smith',
                  emergencyContact: true,
                  noFixedAddress: false,
                  details: [
                    { label: 'Relationship', value: 'Cousin' },
                    {
                      label: 'Phone number',
                      html: '02222222222,<br>033333333333 extension number 777',
                    },
                    { label: 'Email', value: 'test1@email.com, test2@email.com' },
                    { label: 'Address', value: 'Flat A, 13, High Street' },
                    { label: 'Town', value: 'Ulverston' },
                    { label: 'County', value: 'West Yorkshire' },
                    { label: 'Postcode', value: 'LS1 AAA' },
                    { label: 'Country', value: 'England' },
                    {
                      label: 'Address phone',
                      html: '011111111111,<br>011333444 extension number 777',
                    },
                    { label: 'Address type', value: 'Home' },
                  ],
                },
              ],
              professionalContacts: [
                {
                  lastName: 'SMITH',
                  firstName: 'TREVOR',
                  relationshipDescription: 'Case Administrator',
                },
                {
                  lastName: 'LYDYLE',
                  firstName: 'URIUALCHE',
                  relationshipDescription: 'Case Administrator',
                },
                {
                  firstName: 'Jane',
                  lastName: 'Smith',
                  relationshipDescription: 'Prison Offender Manager',
                },
                {
                  firstName: 'John',
                  lastName: 'Doe',
                  relationshipDescription: 'Prison Offender Manager Co-worker',
                },
                { firstName: 'ARENENG', lastName: 'KIMBUR', relationshipDescription: 'Probation Officer' },
              ],
            })
          )
        })
      })

      describe('when there are multiple active addresses but no primary', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
          personService.getPersonContactDetails
            .mockResolvedValueOnce({
              addresses: [
                { ...nonPrimaryAddress, startDate: '2020-01-01', premise: 'Not latest active' },
                { ...nonPrimaryAddress, startDate: '2020-01-02', premise: 'Latest active' },
              ],
              emails: [{ email: 'test1@email.com' }, { email: 'test2@email.com' }],
              phones: [
                { number: '02222222222', type: 'MOB' },
                { number: '033333333333', type: 'MOB', ext: '777' },
              ],
            })
            .mockResolvedValueOnce({
              addresses: [
                { ...businessNonPrimary, startDate: '2020-01-01', premise: 'Not latest active' },
                { ...businessNonPrimary, startDate: '2020-01-02', premise: 'Latest active' },
              ],
              emails: [{ email: 'test3@email.com' }, { email: 'test4@email.com' }],
              phones: [
                { number: '04444444444', type: 'MOB' },
                { number: '055555555555', type: 'BUS', ext: '123' },
              ],
            })
        })

        it('should render the template with the most recently added active address data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalContacts: [
                {
                  name: 'John Smith',
                  emergencyContact: true,
                  noFixedAddress: false,
                  details: [
                    { label: 'Relationship', value: 'Cousin' },
                    { html: '02222222222,<br>033333333333 extension number 777', label: 'Phone number' },
                    { label: 'Email', value: 'test1@email.com, test2@email.com' },
                    { label: 'Address', value: 'Flat B, Latest active, Another Street' },
                    { label: 'Town', value: 'Leeds' },
                    { label: 'County', value: 'West Yorkshire' },
                    { label: 'Postcode', value: 'LS2 BBB' },
                    { label: 'Country', value: 'England' },
                    { html: '011111111111', label: 'Address phone' },
                    { label: 'Address type', value: 'Home' },
                  ],
                },
              ],
            })
          )
        })
      })

      describe('when there are multiple active addresses home active is highest priority', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
          personService.getPersonContactDetails
            .mockResolvedValueOnce({
              addresses: [
                { ...nonPrimaryAddress, startDate: '2020-01-01', premise: 'Not latest active' },
                { ...nonPrimaryAddress, startDate: '2020-01-02', premise: 'Latest active' },
              ],
              emails: [{ email: 'test1@email.com' }, { email: 'test2@email.com' }],
              phones: [
                { number: '02222222222', type: 'MOB' },
                { number: '033333333333', type: 'MOB', ext: '777' },
              ],
            })
            .mockResolvedValueOnce({
              addresses: [
                { ...homeNonPrimary, startDate: '2020-01-01', premise: 'Home active' },
                { ...businessNonPrimary, startDate: '2020-01-02', premise: 'Latest active' },
              ],
              emails: [{ email: 'test3@email.com' }, { email: 'test4@email.com' }],
              phones: [
                { number: '04444444444', type: 'MOB' },
                { number: '055555555555', type: 'BUS', ext: '123' },
              ],
            })
        })

        it('should render the template with the most recently added active address data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalContacts: [
                {
                  name: 'John Smith',
                  emergencyContact: true,
                  noFixedAddress: false,
                  details: [
                    { label: 'Relationship', value: 'Cousin' },
                    { html: '02222222222,<br>033333333333 extension number 777', label: 'Phone number' },
                    { label: 'Email', value: 'test1@email.com, test2@email.com' },
                    { label: 'Address', value: 'Flat B, Latest active, Another Street' },
                    { label: 'Town', value: 'Leeds' },
                    { label: 'County', value: 'West Yorkshire' },
                    { label: 'Postcode', value: 'LS2 BBB' },
                    { label: 'Country', value: 'England' },
                    { html: '011111111111', label: 'Address phone' },
                    { label: 'Address type', value: 'Home' },
                  ],
                },
              ],
            })
          )
        })
      })

      describe('when the address is missing county and/or country', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
          personService.getPersonContactDetails
            .mockResolvedValueOnce({
              addresses: [{ ...primaryAddress, county: undefined, country: undefined }, nonPrimaryAddress],
              emails: [{ email: 'test1@email.com' }, { email: 'test2@email.com' }],
              phones: [
                { number: '02222222222', type: 'MOB' },
                { number: '033333333333', type: 'MOB' },
              ],
            })
            .mockResolvedValueOnce({
              addresses: [{ ...primaryAddress, county: undefined, country: undefined, addressType: 'Business' }],
              emails: [{ email: 'test3@email.com' }, { email: 'test4@email.com' }],
              phones: [
                { number: '04444444444', type: 'MOB' },
                { number: '055555555555', type: 'BUS', ext: '123' },
              ],
            })
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPomByOffenderNo' does not exist on ty... Remove this comment to see the full error message
          allocationManagerApi.getPomByOffenderNo.mockResolvedValue({
            primary_pom: { staffId: 1, name: 'Jane smith' },
          })
        })

        it('should not return related labels and empty values', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalContacts: [
                {
                  name: 'John Smith',
                  emergencyContact: true,
                  noFixedAddress: false,
                  details: [
                    { label: 'Relationship', value: 'Cousin' },
                    { label: 'Phone number', html: '02222222222,<br>033333333333' },
                    { label: 'Email', value: 'test1@email.com, test2@email.com' },
                    { label: 'Address', value: 'Flat A, 13, High Street' },
                    { label: 'Town', value: 'Ulverston' },
                    { label: 'Postcode', value: 'LS1 AAA' },
                    {
                      label: 'Address phone',
                      html: '011111111111,<br>011333444 extension number 777',
                    },
                    { label: 'Address type', value: 'Home' },
                  ],
                },
              ],
            })
          )
        })
      })

      describe('when the contact does not have phone and email', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
          personService.getPersonContactDetails
            .mockResolvedValueOnce({
              addresses: [{ ...primaryAddress, county: undefined, country: undefined }, nonPrimaryAddress],
              emails: [],
              phones: [],
            })
            .mockResolvedValueOnce({
              addresses: [{ ...primaryAddress, county: undefined, country: undefined, addressType: 'Business' }],
              emails: [],
              phones: [],
            })
        })

        it('should not return related labels and empty values', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalContacts: [
                {
                  name: 'John Smith',
                  emergencyContact: true,
                  noFixedAddress: false,
                  details: expect.not.arrayContaining([
                    { label: 'Phone number', html: '' },
                    { label: 'Email', value: '' },
                  ]),
                },
              ],
            })
          )
        })
      })

      describe('when the contact does not have a flat number', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
          personService.getPersonContactDetails
            .mockResolvedValueOnce({
              addresses: [{ ...primaryAddress, flat: undefined }, nonPrimaryAddress],
              emails: [],
              phones: [],
            })
            .mockResolvedValueOnce({
              addresses: [{ ...primaryAddress, flat: undefined, addressType: 'Business' }],
              emails: [],
              phones: [],
            })
        })

        it('should not return it as part of the address field', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalContacts: [
                {
                  name: 'John Smith',
                  emergencyContact: true,
                  noFixedAddress: false,
                  details: expect.arrayContaining([{ label: 'Address', value: '13, High Street' }]),
                },
              ],
            })
          )
        })
      })

      describe('when the personal contacts have no fixed addresses', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonContactDetails' does not exist ... Remove this comment to see the full error message
          personService.getPersonContactDetails
            .mockResolvedValueOnce({
              addresses: [{ ...primaryAddress, noFixedAddress: true }],
              emails: [],
              phones: [],
            })
            .mockResolvedValueOnce({
              addresses: [{ ...primaryAddress, noFixedAddress: true }],
              emails: [],
              phones: [],
            })
        })

        it('should not return the address and also mark them as having no fixed address', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalContacts: [
                {
                  name: 'John Smith',
                  emergencyContact: true,
                  noFixedAddress: true,
                  details: [{ label: 'Relationship', value: 'Cousin' }],
                },
              ],
            })
          )
        })
      })
    })
  })

  describe('addresses', () => {
    const primaryAddress = {
      addressType: 'HOME',
      flat: 'A',
      premise: '13',
      street: 'High Street',
      town: 'Ulverston',
      postalCode: 'LS1 AAA',
      county: 'West Yorkshire',
      country: 'England',
      comment: 'address comment field',
      primary: true,
      noFixedAddress: false,
      startDate: '2019-01-13',
      endDate: '2020-01-13',
      phones: [{ number: '011111111111', type: 'MOB' }],
      addressUsages: [
        {
          addressId: 123,
          addressUsage: 'DAP',
          addressUsageDescription: 'Discharge - Approved Premises',
          activeFlag: false,
        },
        {
          addressId: 123,
          addressUsage: 'HDC',
          addressUsageDescription: 'HDC Address',
          activeFlag: true,
        },
        {
          addressId: 123,
          addressUsage: 'HOST',
          addressUsageDescription: 'Approved Premises',
          activeFlag: true,
        },
      ],
    }

    const nonPrimaryAddress = {
      addressType: 'HOME',
      flat: 'B',
      premise: '13',
      street: 'Another Street',
      town: 'Leeds',
      postalCode: 'LS2 BBB',
      county: 'West Yorkshire',
      country: 'England',
      comment: 'address comment field',
      primary: false,
      noFixedAddress: false,
      startDate: '2020-05-01',
      phones: [{ number: '011111111111', type: 'MOB' }],
      addressUsages: [],
    }

    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockResolvedValue({ bookingId })
    })

    it('should make a call for prisoners addresses', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerAddresses' does not exist on ... Remove this comment to see the full error message
      expect(prisonApi.getPrisonerAddresses).toHaveBeenCalledWith(res.locals, offenderNo)
    })

    describe('when there is missing prisoner address data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            addresses: [
              {
                label: 'Primary address',
                type: undefined,
                noFixedAddress: undefined,
                noAddressMessage: 'No active, primary address entered',
                details: undefined,
              },
            ],
          })
        )
      })
    })

    describe('when there is prisoner address data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerAddresses' does not exist on ... Remove this comment to see the full error message
        prisonApi.getPrisonerAddresses.mockResolvedValue([primaryAddress, nonPrimaryAddress])
        jest.spyOn(Date, 'now').mockImplementation(() => 1578787200000) // Sun Jan 12 2020 00:00:00
      })

      afterEach(() => {
        const spy = jest.spyOn(Date, 'now')
        spy.mockRestore()
      })

      it('should render the template with the correct primary address data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            addresses: [
              {
                label: 'Primary address',
                types: ['HDC Address', 'Approved Premises'],
                noFixedAddress: false,
                noAddressMessage: false,
                details: [
                  { label: 'Address', value: 'Flat A, 13, High Street' },
                  { label: 'Town', value: 'Ulverston' },
                  { label: 'County', value: 'West Yorkshire' },
                  { label: 'Postcode', value: 'LS1 AAA' },
                  { label: 'Country', value: 'England' },
                  { label: 'Phone', html: '011111111111' },
                  { label: 'Added', value: 'January 2019' },
                  { label: 'Comments', value: 'address comment field' },
                ],
              },
            ],
          })
        )
      })

      describe('when the address is missing county and/or country', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerAddresses' does not exist on ... Remove this comment to see the full error message
          prisonApi.getPrisonerAddresses.mockResolvedValue([
            { ...primaryAddress, county: undefined, country: undefined },
            nonPrimaryAddress,
          ])
        })

        it('should not return related labels and empty values', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              addresses: [
                {
                  label: 'Primary address',
                  types: ['HDC Address', 'Approved Premises'],
                  noFixedAddress: false,
                  noAddressMessage: false,
                  details: [
                    { label: 'Address', value: 'Flat A, 13, High Street' },
                    { label: 'Town', value: 'Ulverston' },
                    { label: 'Postcode', value: 'LS1 AAA' },
                    { label: 'Phone', html: '011111111111' },
                    { label: 'Added', value: 'January 2019' },
                    { label: 'Comments', value: 'address comment field' },
                  ],
                },
              ],
            })
          )
        })
      })

      describe('when the prisoners address does not have a flat number', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerAddresses' does not exist on ... Remove this comment to see the full error message
          prisonApi.getPrisonerAddresses.mockResolvedValue([{ ...primaryAddress, flat: undefined }, nonPrimaryAddress])
        })

        it('should not return it as part of the address field', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              addresses: [
                {
                  label: 'Primary address',
                  types: ['HDC Address', 'Approved Premises'],
                  noFixedAddress: false,
                  noAddressMessage: false,
                  details: [
                    { label: 'Address', value: '13, High Street' },
                    { label: 'Town', value: 'Ulverston' },
                    { label: 'County', value: 'West Yorkshire' },
                    { label: 'Postcode', value: 'LS1 AAA' },
                    { label: 'Country', value: 'England' },
                    { label: 'Phone', html: '011111111111' },
                    { label: 'Added', value: 'January 2019' },
                    { label: 'Comments', value: 'address comment field' },
                  ],
                },
              ],
            })
          )
        })
      })

      describe('when the primary address has an end date in the past', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerAddresses' does not exist on ... Remove this comment to see the full error message
          prisonApi.getPrisonerAddresses.mockResolvedValue([
            { ...primaryAddress, endDate: '2020-1-11' },
            nonPrimaryAddress,
          ])
        })

        it('should not return any of the addresses', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              addresses: [
                {
                  label: 'Primary address',
                  type: undefined,
                  noFixedAddress: undefined,
                  noAddressMessage: 'No active, primary address entered',
                  details: undefined,
                },
              ],
            })
          )
        })
      })
    })
  })

  describe('personal care needs', () => {
    it('should make a call for treatment and health types', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getTreatmentTypes' does not exist on typ... Remove this comment to see the full error message
      expect(prisonApi.getTreatmentTypes).toHaveBeenCalledWith(res.locals)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHealthTypes' does not exist on type '... Remove this comment to see the full error message
      expect(prisonApi.getHealthTypes).toHaveBeenCalledWith(res.locals)
    })

    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockResolvedValue({ bookingId })
    })

    it('should make a call for care needs, adjustments and agencies data', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonalCareNeeds' does not exist on ... Remove this comment to see the full error message
      expect(prisonApi.getPersonalCareNeeds).toHaveBeenCalledWith(res.locals, bookingId, '')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getReasonableAdjustments' does not exist... Remove this comment to see the full error message
      expect(prisonApi.getReasonableAdjustments).toHaveBeenCalledWith(res.locals, bookingId, '')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencies' does not exist on type '{}'... Remove this comment to see the full error message
      expect(prisonApi.getAgencies).toHaveBeenCalledWith(res.locals)
    })

    describe('when there is no care needs and adjustments data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            careNeedsAndAdjustments: {
              personalCareNeeds: undefined,
              reasonableAdjustments: undefined,
            },
          })
        )
      })
    })

    describe('when there is care needs and adjustments data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonalCareNeeds' does not exist on ... Remove this comment to see the full error message
        prisonApi.getPersonalCareNeeds = jest.fn().mockResolvedValue({
          personalCareNeeds: [
            {
              problemType: 'DISAB',
              problemCode: 'ND',
              problemStatus: null,
              problemDescription: 'No Disability',
              commentText: null,
              startDate: '2013-10-29',
              endDate: null,
            },
            {
              problemType: 'PSYCH',
              problemCode: 'BIP',
              problemStatus: 'ON',
              problemDescription: 'Bi-Polar',
              commentText: 'Bi polar comment text',
              startDate: '2020-05-19',
              endDate: null,
            },
            {
              problemType: 'PHY',
              problemCode: 'ASTH',
              problemStatus: 'ON',
              problemDescription: 'Asthmatic',
              commentText: 'Asthmatic comment text',
              startDate: '2020-05-01',
              endDate: null,
            },
          ],
        })
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHealthTypes' does not exist on type '... Remove this comment to see the full error message
        prisonApi.getHealthTypes = jest.fn().mockResolvedValue([
          {
            domain: 'HEALTH',
            code: 'DISAB',
            description: 'Disability',
          },
          {
            domain: 'HEALTH',
            code: 'PSYCH',
            description: 'Psychological',
          },
        ])
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getReasonableAdjustments' does not exist... Remove this comment to see the full error message
        prisonApi.getReasonableAdjustments = jest.fn().mockResolvedValue({
          reasonableAdjustments: [
            {
              treatmentCode: 'AMP TEL',
              commentText: 'Amped telephone comment',
              startDate: '2020-05-19',
              endDate: null,
              agencyId: 'MDI',
            },
            {
              treatmentCode: 'FLEX_REFRESH',
              commentText: 'Flexible drinks comments',
              startDate: '2020-05-01',
              endDate: null,
              agencyId: 'MDI',
            },
          ],
        })
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getTreatmentTypes' does not exist on typ... Remove this comment to see the full error message
        prisonApi.getTreatmentTypes = jest.fn().mockResolvedValue([
          {
            domain: 'HEALTH_TREAT',
            code: 'AMP TEL',
            description: 'Amplified telephone',
          },
          {
            domain: 'HEALTH_TREAT',
            code: 'FLEX_REFRESH',
            description: 'Flexible refreshment breaks',
          },
        ])

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencies' does not exist on type '{}'... Remove this comment to see the full error message
        prisonApi.getAgencies = jest.fn().mockResolvedValue([
          {
            agencyId: 'MDI',
            description: 'MOORLAND (HMP & YOI)',
            formattedDescription: 'Moorland (HMP & YOI)',
          },
        ])
      })

      it('should make a call for care needs and adjustments with the available treatment and health types', async () => {
        await controller(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getReasonableAdjustments' does not exist... Remove this comment to see the full error message
        expect(prisonApi.getReasonableAdjustments).toHaveBeenCalledWith(res.locals, bookingId, 'AMP TEL,FLEX_REFRESH')
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonalCareNeeds' does not exist on ... Remove this comment to see the full error message
        expect(prisonApi.getPersonalCareNeeds).toHaveBeenCalledWith(res.locals, bookingId, 'DISAB,PSYCH')
      })

      it('should render the personal template with the correct personal care need and reasonable adjustment data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            careNeedsAndAdjustments: {
              personalCareNeeds: [
                {
                  type: 'Psychological',
                  description: 'Bi-Polar',
                  details: [
                    { label: 'Description', value: 'Bi polar comment text' },
                    { label: 'From', value: '19 May 2020' },
                    { label: 'Status', value: 'Ongoing' },
                  ],
                },
              ],
              reasonableAdjustments: [
                {
                  type: 'Flexible refreshment breaks',
                  details: [
                    { label: 'Establishment', value: 'Moorland (HMP & YOI)' },
                    { label: 'Date provided', value: '01 May 2020' },
                    { label: 'Comment', value: 'Flexible drinks comments' },
                  ],
                },
                {
                  type: 'Amplified telephone',
                  details: [
                    { label: 'Establishment', value: 'Moorland (HMP & YOI)' },
                    { label: 'Date provided', value: '19 May 2020' },
                    { label: 'Comment', value: 'Amped telephone comment' },
                  ],
                },
              ],
            },
          })
        )
      })

      it('should not return NR records', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonalCareNeeds' does not exist on ... Remove this comment to see the full error message
        prisonApi.getPersonalCareNeeds = jest.fn().mockResolvedValue({
          personalCareNeeds: [
            {
              problemType: 'DISAB',
              problemCode: 'NR',
              problemStatus: 'ON',
              problemDescription: 'No Disability Recorded',
              commentText: 'No disability recorded details go here',
              startDate: '2020-07-22',
              endDate: null,
            },
          ],
        })

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            careNeedsAndAdjustments: expect.objectContaining({
              personalCareNeeds: [],
            }),
          })
        )
      })
    })
  })

  describe('when there are errors with retrieving information', () => {
    beforeEach(() => {
      req.params.offenderNo = offenderNo
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getIdentifiers' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getIdentifiers.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderAliases' does not exist on ty... Remove this comment to see the full error message
      prisonApi.getOffenderAliases.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProperty' does not exist on t... Remove this comment to see the full error message
      prisonApi.getPrisonerProperty.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerContacts' does not exist on t... Remove this comment to see the full error message
      prisonApi.getPrisonerContacts.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerAddresses' does not exist on ... Remove this comment to see the full error message
      prisonApi.getPrisonerAddresses.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSecondaryLanguages' does not exist on... Remove this comment to see the full error message
      prisonApi.getSecondaryLanguages.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPersonalCareNeeds' does not exist on ... Remove this comment to see the full error message
      prisonApi.getPersonalCareNeeds.mockRejectedValue(new Error('Network error'))
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getReasonableAdjustments' does not exist... Remove this comment to see the full error message
      prisonApi.getReasonableAdjustments.mockRejectedValue(new Error('Network error'))
    })

    it('should still render the personal template with missing data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({
          aliases: null,
          identifiers: [{ label: 'PNC number', value: null }],
          personalDetails: expect.objectContaining({ property: null }),
          personalContacts: undefined,
          professionalContacts: [],
          addresses: [
            {
              details: null,
              label: 'Primary address',
              noAddressMessage: 'No active, primary address entered',
              noFixedAddress: null,
              types: undefined,
            },
          ],
          languages: expect.objectContaining({ secondaryLanguages: null }),
          careNeedsAndAdjustments: { personalCareNeeds: null, reasonableAdjustments: null },
        })
      )
    })
  })

  describe('learner profile data', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not ex... Remove this comment to see the full error message
      esweService.getNeurodiversities = jest.fn()
    })

    it('should return null for a failed request', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not ex... Remove this comment to see the full error message
      esweService.getNeurodiversities.mockRejectedValue(new Error())
      await controller(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({ neurodiversities: null })
      )
    })

    it('should return a list of learner profiles for a successful request', async () => {
      const neurodiversities = [
        {
          establishmentName: 'HMP Moorland',
          details: [
            {
              label: 'Description',
              html: "<p class='govuk-body'>Visual impairment</p><p class='govuk-body'>Dyslexia</p>",
            },
            { label: 'Location', value: 'HMP Moorland' },
          ],
        },
      ]
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not ex... Remove this comment to see the full error message
      esweService.getNeurodiversities.mockResolvedValue(neurodiversities)
      await controller(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({ neurodiversities })
      )
    })

    it('should return true for displaying neurodiversity feature if no username is flagged', async () => {
      const neurodiversities = [
        {
          establishmentName: 'HMP Moorland',
          details: [
            {
              label: 'Description',
              html: "<p class='govuk-body'>Visual impairment</p><p class='govuk-body'>Dyslexia</p>",
            },
            { label: 'Location', value: 'HMP Moorland' },
          ],
        },
      ]
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not ex... Remove this comment to see the full error message
      esweService.getNeurodiversities.mockResolvedValue(neurodiversities)
      config.app.neurodiversityEnabledUsernames = ''
      await controller(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({ displayNeurodiversity: true })
      )
    })
    it('should return false for displaying neurodiversity feature if the username is not flagged but there are some other flagged usernames', async () => {
      const neurodiversities = [
        {
          establishmentName: 'HMP Moorland',
          details: [
            {
              label: 'Description',
              html: "<p class='govuk-body'>Visual impairment</p><p class='govuk-body'>Dyslexia</p>",
            },
            { label: 'Location', value: 'HMP Moorland' },
          ],
        },
      ]
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not ex... Remove this comment to see the full error message
      esweService.getNeurodiversities.mockResolvedValue(neurodiversities)
      config.app.neurodiversityEnabledUsernames = 'DBULL_GEN'
      await controller(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({ displayNeurodiversity: false })
      )
    })
  })

  describe('learner neurodivergence information', () => {
    const prisonerNotAllowedData = {
      activeAlertCount: 1,
      agencyId: 'MDI',
      alerts: [],
      assignedLivingUnit: {
        description: 'CELL-123',
        agencyName: 'Moorland Closed',
      },
      bookingId,
      category: 'Cat C',
      csra: 'High',
      csraClassificationCode: 'HI',
      csraClassificationDate: '2016-11-23',
      firstName: 'TEST',
      inactiveAlertCount: 2,
      lastName: 'PRISONER',
      assessments: [],
    }
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not ex... Remove this comment to see the full error message
      esweService.getNeurodivergence = jest.fn().mockResolvedValue({
        prn: 'ABC123',
        establishmentId: 'MDI',
        establishmentName: 'Moorland (HMP & YOI)',
        neurodivergenceSelfDeclared: NeurodivergenceSelfDeclared.Autism,
        selfDeclaredDate: '10 February 2022',
        neurodivergenceAssessed: NeurodivergenceAssessed.Alzheimers,
        assessmentDate: '12 February 2022',
        neurodivergenceSupport: [NeurodivergenceSupport.Reading, NeurodivergenceSupport.AuditorySupport],
        supportDate: '14 February 2022',
      })
    })

    it('should return null for a failed request', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not ex... Remove this comment to see the full error message
      esweService.getNeurodivergence.mockRejectedValue(new Error())
      await controller(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({ neurodivergence: null })
      )
    })

    it('should return learner neurodivergence details for a successful request', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({
          neurodivergence: {
            prn: 'ABC123',
            establishmentId: 'MDI',
            establishmentName: 'Moorland (HMP & YOI)',
            neurodivergenceAssessed: NeurodivergenceAssessed.Alzheimers,
            assessmentDate: '12 February 2022',
            neurodivergenceSelfDeclared: NeurodivergenceSelfDeclared.Autism,
            selfDeclaredDate: '10 February 2022',
            neurodivergenceSupport: [NeurodivergenceSupport.Reading, NeurodivergenceSupport.AuditorySupport],
            supportDate: '14 February 2022',
          },
        })
      )
    })

    it('should return true for displaying neurodiversity feature if no username is flagged', async () => {
      const neurodivergence = [
        {
          establishmentName: 'HMP Moorland',
          details: [
            {
              label: 'Description',
              html: "<p class='govuk-body'>Visual impairment</p><p class='govuk-body'>Dyslexia</p>",
            },
            { label: 'Location', value: 'HMP Moorland' },
          ],
        },
      ]
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not ex... Remove this comment to see the full error message
      esweService.getNeurodivergence.mockResolvedValue(neurodivergence)
      config.app.neurodiversityEnabledUsernames = ''
      await controller(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({ displayNeurodiversity: true })
      )
    })

    it('should return false for displaying neurodiversity feature if the username is not flagged but there are some other flagged usernames', async () => {
      const neurodivergence = [
        {
          establishmentName: 'HMP Moorland',
          details: [
            {
              label: 'Description',
              html: "<p class='govuk-body'>Visual impairment</p><p class='govuk-body'>Dyslexia</p>",
            },
            { label: 'Location', value: 'HMP Moorland' },
          ],
        },
      ]
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not ex... Remove this comment to see the full error message
      esweService.getNeurodivergence.mockResolvedValue(neurodivergence)
      config.app.neurodiversityEnabledUsernames = 'DBULL_GEN'
      await controller(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({ displayNeurodiversity: false })
      )
    })

    it('should return an empty object if prisoner not in users caseload', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockReturnValue({ ...prisonerProfileData, agencyId: 'MDI' })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo)

      await controller(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({ neurodivergence: { content: [], enabled: false } })
      )
    })
  })
})
