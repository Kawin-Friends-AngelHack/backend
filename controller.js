
const mysql = require('promise-mysql')
let config = {}

try{
    config = require('./config')
}catch(e){
    config.mysql = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        connectionLimit: 10
    }
}





pool = mysql.createPool(config.mysql)


module.exports = {
    getUsers:function(req,res){
        let uid = req.params.uid
        pool.query('SELECT * FROM customer WHERE u_id <> ?',[uid])
        .then(function(rows){
            if(!rows){
                console.log('No rows')
                return
            }
            res.json(rows)
        })
        .catch(function(err){
            console.log(err)
        })
    },
    getUser:function(req,res){
        let uid = req.params.uid

        if(!uid){
            res.status(400).send('No uid')
        }

        pool.query('SELECT * FROM customer WHERE u_id = ?',[uid])
        .then(function(rows){
            if(!rows){
                console.log('No rows')
                return
            }
            res.json(rows[0])
        })
        .catch(function(err){
            console.log(err)
        })
    },
    createUser:function(req,res){
        let fields = [
            'u_id',
            'name',
            'gender'
        ]

        pool.query(`
            INSERT INTO 
                customer (u_id, name, gender, image) 
            VALUES (?,?,?,?);
        `,[
            req.body['u_id'],
            req.body['name'],
            req.body['gender'],
            (Math.floor(Math.random() * 5) + 1)+'.png' 
        ])
        .then(function(result){
            if(result.affectedRows!==1){
                console.log("Can't insert")
                return
            }

            res.json('ok')
        })
        .catch(function(err){
            console.log(err)
        })

    },
    getInterest:function(req,res){
        pool.query('SELECT DISTINCT interest FROM customer_int;')
        .then(function(rows){
            if(!rows){
                console.log('No rows')
                return
            }
            res.json(rows.map(row=>row.interest))
        })
        .catch(function(err){
            console.log(err)
        })
    },
    createInterest:function(req,res){
        let fields = [
            'u_id',
            'interest',
            'rate'
        ]

        pool.query(`
            INSERT INTO 
                customer_int (u_id, interest, rate,t_created_datetime) 
            VALUES (?,?,?,NOW());
        `,[
            req.body['u_id'],
            req.body['interest'],
            req.body['rate']
        ])
        .then(function(result){
            if(result.affectedRows!==1){
                console.log("Can't insert")
                return
            }

            res.json('ok')
        })
        .catch(function(err){
            console.log(err)
        })


    },
    getEvents:function(req,res){
        let budget = req.body['budget']
        let uid = req.body['u_id']


        if(!uid){
            res.status(400).send('No uid')
        }

        if(!budget){
            budget=10000000
        }


        let isSingle = uid.length === 1


        let singleSQL = `
            SELECT event_name, location, sum(rate) as fitrate from customer c
            LEFT JOIN customer_int ci ON c.u_id = ci.u_id
            LEFT JOIN event e ON ci.interest = e.interest and  (e.gender = 'a' or e.gender = c.gender)
            WHERE 
                c.u_id = ? AND
                price < ? 
            GROUP BY c.u_id, name, event_name,location
            ORDER BY name, sum(rate) DESC, event_name DESC;
        `

        let multiSQL = `
            select event_name, location, sum(normalized_rate) as fitrate 
            from (
            select ci.u_id, name, interest, rate,sumrate,rate/sumrate as normalized_rate from customer c
            left join customer_int ci on c.u_id = ci.u_id
            left join 
            (select u_id, sum(rate) as sumrate from customer_int
            group by u_id) sq2 on ci.u_id = sq2.u_id 
            where ci.u_id in (?)
            ) norm
            left join event e on norm.interest = e.interest 
            where e.gender  = 'a'
            and price < ?
            group by event_name, location
            order by fitrate desc, event_name desc
        `

        if(isSingle){
            pool.query(singleSQL,[uid[0],budget])
            .then(function(rows){
                if(!rows){
                    console.log('No rows')
                    return
                }
                res.json(rows)
            })
            .catch(function(err){
                console.log(err)
            })
            return
        }

        pool.query(multiSQL,[uid,budget])
        .then(function(rows){
            if(!rows){
                console.log('No rows')
                return
            }
            res.json(rows)
        })
        .catch(function(err){
            console.log(err)
        })
        
        return

    },
    getEvent:function(req,res){
        let name = req.params.name

        if(!name){
            res.status(400).send('No name')
        }

        pool.query('SELECT * FROM event WHERE event_name = ? LIMIT 1;',[name])
        .then(function(rows){
            if(!rows){
                console.log('No rows')
                return
            }
            res.json(rows[0])
        })
        .catch(function(err){
            console.log(err)
        })
    }


}