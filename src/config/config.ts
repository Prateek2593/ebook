import {config as conf} from 'dotenv';
conf();

const _config = {
    port:process.env.PORT
}

//Object.freeze() - Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
export const config = Object.freeze(_config)