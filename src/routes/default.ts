import {Request, Response, Router } from 'express';

let router = Router();

router.get('', (req: Request, res: Response) => {
    res.render('default/index');
});

export = router;

