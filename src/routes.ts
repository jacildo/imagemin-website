import { Request, Response, Router } from 'express';
import * as path from 'path';

import * as defaultRoutes from './routes/default';
import * as apiRoutes from './routes/api';

let router = Router();


router.use('', defaultRoutes);
router.use('api', apiRoutes);

export = router;