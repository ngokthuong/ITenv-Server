import accountRouter from './auth.routes'
import { Express } from 'express'
import { notFound, errHandler } from '../middleware/handelError.mdw'

const initRoutes = (app: Express) => {
    // API
    app.use('/api/account', accountRouter)


    //  ko tim dc api
    app.use(notFound)
    app.use(errHandler)
}


export default initRoutes