const moment = require('moment')

const getIepHistoryFactory = elite2Api => {
  const getIepHistory = async (context, offenderNo, params) => {
    const bookingDetails = await elite2Api.getDetails(context, offenderNo)
    const iepSummary = await elite2Api.getIepSummaryWithDetails(context, bookingDetails.bookingId)

    // Offenders are likely to have multiple IEPs at the same agency.
    // By getting a unique list of users and agencies, we reduce the duplicate
    // calls to the database.
    const uniqueUserIds = [...new Set(iepSummary.iepDetails.map(details => details.userId))]
    const uniqueAgencyIds = [...new Set(iepSummary.iepDetails.map(details => details.agencyId))]
    const levels = [...new Set(iepSummary.iepDetails.map(details => details.iepLevel))]

    const users = await Promise.all(
      uniqueUserIds.filter(userId => Boolean(userId)).map(userId => elite2Api.getStaffDetails(context, userId))
    )

    const establishments = await Promise.all(
      uniqueAgencyIds
        .filter(agencyId => Boolean(agencyId))
        .map(agencyId => elite2Api.getAgencyDetails(context, agencyId))
    )

    const iepHistoryDetails = iepSummary.iepDetails.map(details => {
      const { description } = establishments.find(estb => estb.agencyId === details.agencyId)
      const user = details.userId && users.find(u => u.username === details.userId)
      return {
        iepEstablishment: description,
        iepStaffMember: user && `${user.firstName} ${user.lastName}`,
        formattedTime: moment(details.iepTime, 'YYYY-MM-DD HH:mm').format('DD/MM/YYYY - HH:mm'),
        ...details,
      }
    })

    const [summaryDetail, ...iepDetails] = iepHistoryDetails

    const nextReviewDate = moment(summaryDetail.iepTime, 'YYYY-MM-DD HH:mm')
      .add(1, 'years')
      .format('DD/MM/YYYY')

    let filteredResults = iepDetails

    if (params.establishment) {
      filteredResults = filteredResults.filter(result => result.agencyId === params.establishment)
    }

    if (params.level) {
      filteredResults = filteredResults.filter(result => result.iepLevel === params.level)
    }

    if (params.fromDate) {
      const fromDate = moment(params.fromDate)
      filteredResults = filteredResults.filter(result => moment(result.iepTime).isSameOrAfter(fromDate))
    }

    if (params.toDate) {
      const toDate = moment(params.toDate)
      filteredResults = filteredResults.filter(result => moment(result.iepTime).isSameOrBefore(toDate))
    }

    return {
      currentIepLevel: iepSummary.iepLevel,
      daysOnIepLevel: iepSummary.daysSinceReview,
      establishments,
      levels,
      nextReviewDate,
      currentIepDateTime: iepSummary.iepTime,
      results: filteredResults,
      offenderName: `${bookingDetails.firstName} ${bookingDetails.lastName}`,
    }
  }

  return {
    getIepHistory,
  }
}

module.exports = { getIepHistoryFactory }
