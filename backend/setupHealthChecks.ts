import express from 'express'
import config from './config'
import healthFactory from './services/healthCheck'
import { joinUrlPath } from './utils'

const router = express.Router()

const health = healthFactory(
  joinUrlPath(config.apis.oauth2.url, '/health/ping'),
  joinUrlPath(config.apis.prisonApi.url, '/health/ping'),
  joinUrlPath(config.apis.whereabouts.url, '/health/ping'),
  joinUrlPath(config.apis.community.url, '/health/ping'),
  joinUrlPath(config.apis.keyworker.url, '/health/ping'),
  joinUrlPath(config.apis.caseNotes.url, '/health/ping'),
  joinUrlPath(config.apis.allocationManager.url, '/health'),
  joinUrlPath(config.apis.tokenverification.url, '/health/ping'),
  joinUrlPath(config.apis.offenderSearch.url, '/health/ping'),
  joinUrlPath(config.apis.complexity.url, '/ping'),
  joinUrlPath(config.apis.incentivesApi.url, '/health/ping')
)

export default () => {
  router.get('/health', (req, res, next) => {
    health((err, result) => {
      if (err) {
        return next(err)
      }
      if (!(result.status === 'UP')) {
        res.status(503)
      }
      res.json(result)
      return result
    })
  })

  router.get('/ping', (req, res) => res.send('pong'))

  return router
}
