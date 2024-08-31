import router from './account.routes'
import accountRouter from './account.routes'
import { Express } from 'express'

const initRoutes = (app: Express) => {
    app.use('/api/account', accountRouter)
}

export default initRoutes