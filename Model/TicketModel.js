const mongoose = require('mongoose')

const TicketSchema = new mongoose.Schema({
    ticketID : {
        type : Number
    },
    customerID : {
        type : Number
    },
    orderId : {
        type : Number
    },
    category : {
        type : String,
        enum : ['Other','Payement','Product'],
        default : 'Other'  
    },
    solved : {
        type : Boolean,
        default : false
    },
    messages : [
        {
            issue : {
                type : String
            },
            createdAt : {
                type : Date
            },
            from : {
                type : String,
                enum : ['User','Customer Support']
            }
        }
    ]
})

TicketSchema.post('save', async (ticket) => {
    console.log("Post Save",ticket);
	
});


const TicketModel = mongoose.model("Ticket", TicketSchema);

module.exports = TicketModel;