require('dotenv').config()

// Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
// In particular, applicationinsights automatically collects bunyan logs
require('./azure-appinsights')

const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const bunyanMiddleware = require('bunyan-middleware')
const hsts = require('hsts')
const helmet = require('helmet')
const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const hrm = require('webpack-hot-middleware')
const ensureHttps = require('./middleware/ensureHttps')

const userCaseLoadsFactory = require('./controllers/usercaseloads').userCaseloadsFactory
const setActiveCaseLoadFactory = require('./controllers/setactivecaseload').activeCaseloadFactory
const { userLocationsFactory } = require('./controllers/userLocations')
const { userMeFactory } = require('./controllers/userMe')
const { getConfiguration } = require('./controllers/getConfig')
const houseblockLocationsFactory = require('./controllers/houseblockLocations').getHouseblockLocationsFactory
const activityLocationsFactory = require('./controllers/activityLocations').getActivityLocationsFactory
const activityListFactory = require('./controllers/activityList').getActivityListFactory
const houseblockListFactory = require('./controllers/houseblockList').getHouseblockListFactory
const { healthFactory } = require('./controllers/health')
const { updateAttendanceFactory } = require('./controllers/updateAttendance')
const establishmentRollFactory = require('./controllers/establishmentRollCount').getEstablishmentRollCountFactory
const { globalSearchFactory } = require('./controllers/globalSearch')

const sessionManagementRoutes = require('./sessionManagementRoutes')
const contextProperties = require('./contextProperties')

const { cookieOperationsFactory } = require('./hmppsCookie')
const tokenRefresherFactory = require('./tokenRefresher').factory
const controllerFactory = require('./controllers/controller').factory

const clientFactory = require('./api/oauthEnabledClient')
const { healthApiFactory } = require('./api/healthApi')
const eliteApiFactory = require('./api/elite2Api').elite2ApiFactory
const oauthApiFactory = require('./api/oauthApi')

const log = require('./log')
const config = require('./config')

const app = express()
const sixtyDaysInSeconds = 5184000

app.set('trust proxy', 1) // trust first proxy

app.set('view engine', 'ejs')

app.use(helmet())

app.use(
  hsts({
    maxAge: sixtyDaysInSeconds,
    includeSubDomains: true,
    preload: true,
  })
)

app.use(
  bunyanMiddleware({
    logger: log,
    obscureHeaders: ['Authorization'],
  })
)

const { health } = healthFactory(config.apis.elite2.url)
app.use('/health', health)
app.use('/info', health)

if (config.app.production) {
  app.use(ensureHttps)
}

app.use(cookieParser())

// Don't cache dynamic resources
app.use(helmet.noCache())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '../build/static')))

app.get('/terms', async (req, res) => {
  res.render('terms', { mailTo: config.app.mailTo, homeLink: config.app.notmEndpointUrl })
})

const healthApi = healthApiFactory(
  clientFactory({
    baseUrl: config.apis.elite2.url,
    timeout: 2000,
  })
)

const elite2Api = eliteApiFactory(
  clientFactory({
    baseUrl: config.apis.elite2.url,
    timeout: config.apis.elite2.timeoutSeconds * 1000,
  })
)

const controller = controllerFactory(
  activityListFactory(elite2Api),
  houseblockListFactory(elite2Api),
  updateAttendanceFactory(elite2Api),
  establishmentRollFactory(elite2Api),
  globalSearchFactory(elite2Api)
)

const oauthApi = oauthApiFactory({ ...config.apis.oauth2 })
const tokenRefresher = tokenRefresherFactory(oauthApi.refresh, config.app.tokenRefreshThresholdSeconds)

const hmppsCookieOperations = cookieOperationsFactory({
  name: config.hmppsCookie.name,
  domain: config.hmppsCookie.domain,
  cookieLifetimeInMinutes: config.hmppsCookie.expiryMinutes,
  secure: config.app.production,
})

/* login, logout, hmppsCookie management, token refresh etc */
sessionManagementRoutes.configureRoutes({
  app,
  healthApi,
  oauthApi,
  hmppsCookieOperations,
  tokenRefresher,
  mailTo: config.app.mailTo,
  homeLink: config.app.notmEndpointUrl,
})

const compiler = webpack(require('../webpack.config.js'))

if (config.app.production === false) {
  app.use(middleware(compiler, { writeToDisk: true }))
  app.use(hrm(compiler, {}))
}

// Extract pagination header information from requests and set on the 'context'
app.use('/api', (req, res, next) => {
  contextProperties.setRequestPagination(res.locals, req.headers)
  next()
})

app.use(express.static(path.join(__dirname, '../build')))

app.use('/api/config', getConfiguration)
app.use('/api/me', userMeFactory(elite2Api).userMe)
app.use('/api/usercaseloads', userCaseLoadsFactory(elite2Api).userCaseloads)
app.use('/api/userLocations', userLocationsFactory(elite2Api).userLocations)
app.use('/api/setactivecaseload', setActiveCaseLoadFactory(elite2Api).setActiveCaseload)
app.use('/api/houseblockLocations', houseblockLocationsFactory(elite2Api).getHouseblockLocations)
app.use('/api/activityLocations', activityLocationsFactory(elite2Api).getActivityLocations)
app.use('/api/houseblocklist', controller.getHouseblockList)
app.use('/api/activityList', controller.getActivityList)
app.use('/api/updateAttendance', controller.updateAttendance)
app.use('/api/establishmentRollCount', controller.getEstablishmentRollCount)
app.use('/api/globalSearch', controller.globalSearch)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
})

const port = process.env.PORT || 3001

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Backend running on port', port)
})
