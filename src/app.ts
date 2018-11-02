import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as routes from './routes';
import * as path from 'path';

class App {

    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        this.app.use(routes);
    }

    private config(): void{
        this.app.use(express.static('public'));

        // View rendering
        this.app.set('views', path.join(__dirname, '../views'));
        this.app.set('view engine', 'pug');

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ 
            extended: false,
            limit: '500mb'
        }));
    }
}

export default new App().app;