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

function buildVehicleQuery(params) {
    let query = `SELECT * FROM vehicles WHERE 1=1`;
    const values = [];
    const searchableParams = {
        make: 'make',
        model: 'model',
        model_year: 'model_year',
        state: 'state',
        ev_type: 'ev_type'
    };

    for (const key in searchableParams){
        if (searchableParams[key]){
            values.push(searchableParams[key]);
            query += ` AND ${searchableParams[key]} = $${values.length}`;
        }
    }
    return {query, values}
}

// TODO
app.get('/api/vehicles', async(req, res) => {
    const { make, year, model, state, ev_type } = req.query;
    let query = `SELECT * FROM vehicles WHERE 1=1`;
    const params = [];

    if (make){
        params.push(make);
        query += `AND make = $${params.length()}`
    }


    try {
        const query = await db.any({
            name: 'Unique makes',
            text: 'SELECT make, COUNT(*) as count FROM vehicles GROUP BY make ORDER BY count DESC'
        });
        res.json(query);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message
          });
    }
})

// // TODO
// app.get('/api/vehicles/:id', async(req, res) => {
//     try {
        
//     } catch (error) {
        
//     }
// })

// GET makes
app.get('/api/makes', async(req, res) => {
    try {
        const query = await db.any({
            name: 'Unique makes',
            text: 'SELECT make, COUNT(*) as count FROM vehicles GROUP BY make ORDER BY count DESC'
        });
        res.json(query);
    } catch (error) {
        console.log('ERROR:', error);
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

db.any({
    name: 'Count Rows',
    text: 'SELECT COUNT(*) FROM vehicles',
})
    .then(user => {
        // user found;
        console.log('USER:', user);
    })
    .catch(error => {
        // error;  
        console.log('ERROR:', error)  
    });

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