import Router from 'express'
import { registerController } from '../controllers/account.controller'

const router = Router();

router.post('/register', registerController);

export default router