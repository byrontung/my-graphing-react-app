require('dotenv').config({ path: '.env.local' })
const express = require('express')
const app = express()
const port = 3000
// TODO: Cors?

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/hello', (req, res) => {
    res.send("I made this hello!")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// postgres

const cn = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    max: 30 // use up to 30 connections

    // "types" - in case you want to set custom type parsers on the pool level
};

const pgp = require('pg-promise')(/* options */)
const db = pgp(cn)

function buildVehicleQueryWithParams(base, params, group = null) {
    // let query = `SELECT * FROM vehicles WHERE 1=1`
    let query = base;
    const values = [];
    const searchableParams = {
        make: 'make',
        model: 'model',
        model_year: 'model_year',
        state: 'state',
        city: 'city',
        ev_type: 'ev_type'
    };

    for (const key in params){
        if (searchableParams[key]){
            values.push(params[key]);
            query += ` AND ${searchableParams[key]} = $${values.length}`;
        }
    }
    if (group){
        query += ` GROUP BY ${group}`;
    }
    if (params.order_by){
        query += ` ORDER BY ${params.order_by} ${params.direction ? params.direction: "DESC"}`
    }

    return {query, values}
}

// GET vehicles
app.get('/api/vehicles', async(req, res) => {
    // pagination?
    let base = `SELECT * FROM vehicles WHERE 1=1`
    const {query, values} = buildVehicleQueryWithParams(base, req.query, null, "model_year");

    try {
        const result = await db.any(query, values);
        res.json(result);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message
          });
    }
})

// GET individual vehicle
app.get('/api/vehicles/:id', async(req, res) => {
    const vehicleId = req.params.id;

    try {
        const result = await db.one('SELECT * FROM vehicles WHERE dol_vehicle_id = $1', [vehicleId]);
        res.json(result);
    } catch (error) {
        console.error('Database error:', error);
        res.status(404).json({ 
            error: 'Not Found',
            details: error.message
          });
    }
})

// GET makes
app.get('/api/makes', async(req, res) => {
    let base = `SELECT make, COUNT(*) as count FROM vehicles WHERE 1=1`;
    const {query, values} = buildVehicleQueryWithParams(base, req.query, "make");

    try {
        const result = await db.any(query, values);
        res.json(result);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message
          });
    }
})

// // TODO
// app.get('/api/models', async(req, res) => {
//     try {
        
//     } catch (error) {
        
//     }
// })

// // TODO: GET stats, might be difficult? needs to compile stats (maybe per state?)
// app.get('/api/stats', async(req, res) => {
//     try {
        
//     } catch (error) {
        
//     }
// })

// Dataset Source
// https://catalog.data.gov/dataset/electric-vehicle-population-data/resource/fa51be35-691f-45d2-9f3e-535877965e69

// SQL Cheat Sheet
// https://github.com/enochtangg/quick-SQL-cheatsheet?tab=readme-ov-file#find

// db.any({
//     name: 'Unique makes',
//     text: 'SELECT make, COUNT(*) as count FROM vehicles GROUP BY make ORDER BY count DESC'
// })
// .then(user => {
//     // user found;
//     console.log('USER:', user);
// })
// .catch(error => {
//     // error;  
//     console.log('ERROR:', error)  
// });

// db.any({
//     name: 'Unique makes',
//     text: 'SELECT make, COUNT(*) as count FROM vehicles GROUP BY make ORDER BY count DESC'
// })
//     .then(query => {
//         // user found;
//         // console.log('USER:', user);
//         res.send(query)
//     })
//     .catch(error => {
//         // error;  
//         console.log('ERROR:', error)  
//     });

// db.any({
//     name: 'Count ALL Teslas',
//     text: 'SELECT COUNT(*) FROM vehicles WHERE make = $1',
//     values: ['TESLA']
// })
//     .then(user => {
//         // user found;
//         console.log('USER:', user);
//     })
//     .catch(error => {
//         // error;  
//         console.log('ERROR:', error)  
//     });

// db.any({
//     name: 'Distinct cafev eligibility',
//     text: 'SELECT DISTINCT cafv_eligibility FROM vehicles'
// })
//     .then(user => {
//         // user found;
//         console.log('USER:', user);
//     })
//     .catch(error => {
//         // error;  
//         console.log('ERROR:', error)  
//     });

// db.any({
//     name: 'Select ALL Teslas',
//     text: 'SELECT * FROM vehicles WHERE make = $1',
//     values: ['TESLA']
// })
//     .then(user => {
//         // user found;
//         console.log('USER:', user);
//     })
//     .catch(error => {
//         // error;  
//         console.log('ERROR:', error)  
//     });

// db.any({
//     name: 'Count Rows',
//     text: 'SELECT COUNT(*) FROM vehicles',
// })
//     .then(user => {
//         // user found;
//         console.log('USER:', user);
//     })
//     .catch(error => {
//         // error;  
//         console.log('ERROR:', error)  
//     });

// db.any({
//     name: 'Count Rows with non-zero non-null MSRP',
//     text: 'SELECT COUNT(*) FROM vehicles WHERE base_msrp IS NOT NULL'
// })
//     .then(user => {
//         // user found;
//         console.log('USER:', user);
//     })
//     .catch(error => {
//         // error;  
//         console.log('ERROR:', error)  
//     });

// db.one('SELECT $1 AS value', 123)
//   .then((data) => {
//     console.log('DATA:', data.value)
//   })
//   .catch((error) => {
//     console.log('ERROR:', error)
//   })