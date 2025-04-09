require("dotenv").config({ path: ".env.local" });
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/hello", (req, res) => {
    res.send("I made this hello!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

// postgres

const cn = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    max: 30, // use up to 30 connections

    // "types" - in case you want to set custom type parsers on the pool level
};

const pgp = require("pg-promise")(/* options */);
const db = pgp(cn);

function buildVehicleQueryWithParams({ base, params, group = null }) {
    // let query = `SELECT * FROM vehicles WHERE 1=1`
    // console.log(base, params);
    let query = base;
    const values = [];
    // const searchableParams = {
    //     make: "make",
    //     model: "model",
    //     model_year: "model_year",
    //     state: "state",
    //     city: "city",
    //     ev_type: "ev_type",
    // };
    const validQueryParams = {
        vin_prefix: "vin_prefix",
        county: "county",
        city: "city",
        state: "state",
        postal_code: "postal_code",
        model_year: "model_year",
        make: "make",
        model: "model",
        ev_type: "ev_type",
        cafv_eligibility: "cafv_eligibility",
        electric_range: "electric_range",
        legislative_district: "legislative_district",
        dol_vehicle_id: "dol_vehicle_id",
        electric_utility: "electric_utility",
        census_tract: "census_tract",
    };
    const validOrderByParams = [
        "vin_prefix",
        "county",
        "city",
        "state",
        "postal_code",
        "model_year",
        "make",
        "model",
        "ev_type",
        "cafv_eligibility",
        "electric_range",
        "base_msrp",
        "legislative_district",
        "electric_utility",
        "census_tract",
        "count"
    ];
    const validDirection = ["DESC", "ASC"];

    for (const key in params) {
        if (validQueryParams[key]) {
            values.push(params[key]);
            query += ` AND ${validQueryParams[key]} = $${values.length}`;
        }
    }
    // group comes from the base API, not the query. No need to check for sqli
    if (group) {
        query += ` GROUP BY ${group}`;
    }
    if (params.order_by && validOrderByParams.includes(params.order_by)) {
        let direction = "DESC";
        if (params.direction && validDirection.includes(params.direction)) {
            direction = params.direction;
        }
        query += ` ORDER BY ${params.order_by} ${direction}`;
    }
    if (params.limit) {
        const parsedLimit = parseInt(params.limit);
        if (!isNaN(parsedLimit)) {
            query += ` LIMIT ${parsedLimit}`;
        }
    }
    // console.log(query, values);
    return { query, values };
}

// GET vehicles
app.get("/api/vehicles", async (req, res) => {
    // pagination?
    let base = `SELECT * FROM vehicles WHERE 1=1`;
    const { query, values } = buildVehicleQueryWithParams({
        base: base,
        params: req.query,
    });

    try {
        const result = await db.any(query, values);
        res.json(result);
    } catch (error) {
        // TODO: error catching function
        console.error("Database error:", error);
        // error comes from pgpromise
        if (error.name === "QueryResultError") {
            return res.status(404).json(error.message);
        }
        // error comes from psql engine
        if (error.code === "42703") {
            return res.status(400).json(error.message);
        }

        return res.status(500).json(error.message);
    }
});

// GET individual vehicle
app.get("/api/vehicles/:id", async (req, res) => {
    const vehicleId = req.params.id;

    try {
        const result = await db.oneOrNone(
            "SELECT * FROM vehicles WHERE dol_vehicle_id = $1",
            [vehicleId],
        );
        res.json(result);
    } catch (error) {
        console.error("Database error:", error);
        // TODO: QueryResultError comes from the expectation of db.*
        //       Other queries use any, therefore we don't need QueryResultError?
        // error comes from pgpromise
        if (error.name === "QueryResultError") {
            return res.status(404).json(error.message);
        }
        // error comes from psql engine
        if (error.code === "42703") {
            return res.status(400).json(error.message);
        }

        return res.status(500).json(error.message);
    }
});

// GET makes
app.get("/api/makes", async (req, res) => {
    let base = `SELECT make, COUNT(*) as count FROM vehicles WHERE 1=1`;
    const { query, values } = buildVehicleQueryWithParams({
        base: base,
        params: req.query,
        group: "make",
    });

    try {
        const result = await db.any(query, values);
        res.json(result);
    } catch (error) {
        console.error("Database error:", error);
        // error comes from pgpromise
        if (error.name === "QueryResultError") {
            return res.status(404).json(error.message);
        }
        // error comes from psql engine
        if (error.code === "42703") {
            return res.status(400).json(error.message);
        }

        return res.status(500).json(error.message);
    }
});

// GET models
app.get("/api/models", async (req, res) => {
    let base = `SELECT model, COUNT(*) as count FROM vehicles WHERE 1=1`;
    const { query, values } = buildVehicleQueryWithParams({
        base: base,
        params: req.query,
        group: "model",
    });

    try {
        const result = await db.any(query, values);
        res.json(result);
    } catch (error) {
        console.error("Database error:", error);
        // error comes from pgpromise
        if (error.name === "QueryResultError") {
            return res.status(404).json(error.message);
        }
        // error comes from psql engine
        if (error.code === "42703") {
            return res.status(400).json(error.message);
        }

        return res.status(500).json(error.message);
    }
});

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
