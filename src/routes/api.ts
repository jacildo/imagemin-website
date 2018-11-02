import {Request, Response, Router } from 'express';

let router = Router();

router.get('downloads', (req: Request, res: Response) => {
    res.json({status: "OK"});
});

export = router;

