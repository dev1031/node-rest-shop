const express = require('express');
const router = express.Router();
const Order = require("../models/order");
const Product = require("../models/product");
const mongoose = require('mongoose');

router.get('/', (req, res, next)=>{
    Order.find()
    .select('_id quantity product')
    .populate('product', 'name')
    .exec()
    .then( docs =>{
        console.log( docs);
        res.status(200).json({
            count: docs.length,
            orders : docs.map(doc=>{
                return {
                    _id:doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request:{
                        url: "http//localhost:3000/orders/" + doc._id,
                        type:'GET'
                    }
                }
            })
           
        })
    })
    .catch( err =>{
        console.log( err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', (req, res, next)=>{
    Product.findById(req.body.productId)
    .then( product=>{
        if(!product){
            res.status(400).json({
                message: 'not found'
            });
        }
        const order = new Order({
            _id :  mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
            
        });
        return order.save()
    })
        .then(result =>{
            console.log(result)
            res.status(200).json({
                message:'Order Created',
                createdOrder:{
                    _id: result._id,
                    quantity: result.quantity,
                    product: result.product
                },
                request :{
                    type:'GET',
                    url:'http//localhost:3000/orders' + result._id
                }
            });
        })
        .catch( err =>{
            console.log( err);
            res.status(500).json({
                error: err
            });
        
    })
    .catch(err=>{
        res.status(500).json({
            message:"This order can't be completed",
            error : err
        });
    });
    
});

router.get('/:orderId',(req, res , next)=>{
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order=>{
        if(!order){
            return res.status(404).json({
                message: "order not found"
            });
        }
        res.status(200).json({
            order:order,
            request: {
            type:'GET',
            url:"http//localhost:3000/orders/" 
            }
        });
    })
    .catch( err=>{
        res.status(500).json({
            error : err
        })
    })

});

router.delete('/:orderId', (req, res, next)=>{
   Order.remove({_id : req.params.orderId})
   .exec()
   .then( result =>{
       res.status(200).json({
           message: 'order deleted',
           request: {
               type:'GET',
               url:"http//localhost:3000/orders"
           }

       });
   })
   .catch( err =>{
       console.log(err);
       res.status(500).json({
           error: err
       })
   })
});

module.exports = router;