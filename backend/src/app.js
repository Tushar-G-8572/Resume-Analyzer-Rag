import express from 'express'
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import applyRouter from './routes/application.route.js';
import jobRouter from './routes/job.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use('/api/auth',authRouter);
app.use('/api/jobs',jobRouter);
app.use('/api/apply',applyRouter);

export default app;

