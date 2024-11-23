import express from 'express';

const app = express();

// Routes
app.get('/', (req, res, next) => {
    res.json({message:"Hello APIs!"});
})

export default app;