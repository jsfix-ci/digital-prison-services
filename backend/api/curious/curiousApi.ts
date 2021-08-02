import querystring from 'qs'
import type { ClientContext, OauthApiClient } from '../oauthEnabledClient'

export default class CuriousApi {
  static create(client: OauthApiClient): CuriousApi {
    return new CuriousApi(client)
  }

  constructor(private readonly client: OauthApiClient) {}

  getLearnerProfiles(
    context: ClientContext,
    nomisId: string,
    establishmentId?: number
  ): Promise<curious.LearnerProfile[]> {
    return this.client
      .get<curious.LearnerProfile[]>(context, this.applyQuery(`/learnerProfile/${nomisId}`, { establishmentId }))
      .then((response) => response.body)
  }

  getLearnerEducation(context: ClientContext, nomisId: string): Promise<curious.LearnerEducation[]> {
    return this.client
      .get<curious.LearnerEducation[]>(context, `/learnerEducation/${nomisId}`)
      .then((response) => response.body)
  }

  getLearnerLatestAssessments(context: ClientContext, nomisId: string): Promise<curious.LearnerLatestAssessment[]> {
    return this.client
      .get<curious.LearnerProfile[]>(context, `/latestLearnerAssessments/${nomisId}`)
      .then((response) => response.body)
  }

  getLearnerGoals(context: ClientContext, nomisId: string): Array<curious.LearnerGoals> {
    // return this.client
    //   .get<curious.LearnerProfile[]>(context, `/latestLearnerAssessments/${nomisId}`)
    //   .then((response) => response.body)
    return [
      {
        prn: 'sdfsdfs',
        employmentGoals: ['To be a plumber', 'To get a plumbing qualification'],
        personalGoals: [
          'To be able to support my family',
          'To get a 100% attendance record on my classes',
          'To make my mum proud',
        ],
        longTermGoals: ['To buy a house'],
        shortTermGoals: ['To get out of my overdraft'],
      },
    ]
  }

  private applyQuery = (path, query?: Record<string, unknown>) =>
    this.hasNonEmptyValues(query) ? `${path}?${querystring.stringify(query)}` : path

  private hasNonEmptyValues = (object?: Record<string, unknown>) =>
    object && Object.values(object).filter((value) => !!value).length > 0
}
