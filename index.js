const express = require('express')
const cors = require('cors')
const app =express();
const port = process.env.PORT || 5000
require('dotenv').config()


//middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json())

app.get('/',(req,res)=>{
  res.send('group study server is running')
})



app.listen(port,()=>{
  console.log(`server is running on PORT: ${port}`);
})

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fpdogwm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
   
    //database collection
    const assignmentCollection = client.db("groupStudyDB").collection("allassignment")




    //post all assignment to the server

    app.post('/allassignment',async(req,res)=>{
      const newAssignment = req.body;
      const result = await assignmentCollection.insertOne(newAssignment)
      res.send(result)
    })


    //get all data

    app.get('/allassignment',async(req,res)=>{
      const cursor = assignmentCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })



    //pagination all data
    app.get('/allassignmentcount',async(req,res)=>{
      const count =await assignmentCollection.estimatedDocumentCount()
      res.send({count})
    })




     //delete data
     app.delete('/allassignment/:id',async(req,res)=>{
      const id=req.params.id;
      console.log('please delete this',id);
      const query =  {_id: new ObjectId(id)}
      const result = await assignmentCollection.deleteOne(query)
      res.send(result)
     })

     //update data
     app.get('/update/:id',async(req,res)=>{
      const id =req.params.id;
      const query ={_id: new ObjectId(id)}
      const assignment =await assignmentCollection.findOne(query)
      res.send(assignment)
     })
    
     app.put('/update/:id',async(req,res)=>{
      const id =req.params.id;
      const assignment =req.body
      console.log(assignment);
      const filter ={_id: new ObjectId(id)}
      const options ={upsert: true}
      const updatedAssignment = {
        $set:{
          title: assignment.title,
          des: assignment.des,
          photo: assignment.photo,
          type: assignment.type,
          marks: assignment.marks,
          date:assignment.date,
        }
      }
      const result = await assignmentCollection.updateOne(filter,updatedAssignment,options)
      res.send(result)
     })

    //create database for submit assignment
    const submitCollection = client.db("groupStudyDB").collection("submitassignment")
    //assignment submission post
    app.post('/submitassignment',async(req,res)=>{
      const newSubmitAssignment = req.body;
      const result = await submitCollection.insertOne(newSubmitAssignment)
      res.send(result)
    })

  
   //another 
   app.get('/marked/:id',async(req,res)=>{
    const id =req.params.id;
    const query ={_id: new ObjectId(id)}
    const assignment =await submitCollection.findOne(query)
    res.send(assignment)
   })

   //update
   app.patch('/marked/:id',async(req,res)=>{
    const id = req.params.id;
    const filter ={_id: new ObjectId(id)}
    const updateSubmitAssignment = req.body;
    console.log(updateSubmitAssignment);
      const updateDoc = {
        $set:{
          status: updateSubmitAssignment.status,
          givenNumber: updateSubmitAssignment.givenNumber,
          feedback: updateSubmitAssignment.feedback,
          
        }
      }
      const result= await submitCollection.updateOne(filter,updateDoc)
      res.send(result)
   })
   

//submit get email specific

// app.get('/submitassignment/byemail',async(req,res)=>{
//   console.log(req.query);
// //   let query={}
// //   if(req.query?.email){
// //    query={email:req.query.email}
// //   }
// //  const cursor =submitCollection.find(query)
// //  const result=await cursor.toArray()
// //  res.send(result)
// })




    // //update status
    // app.patch('/submitassignment/:id',async(req,res)=>{
    //   const id=req.params.id;
    //   const filter ={_id: new ObjectId(id)}
    //   const updateSubmitAssignment = req.body;
    //   console.log(updateSubmitAssignment);
    //   const updateDoc ={
    //     $set:{
    //       status: updateSubmitAssignment.status
    //     }
    //   }
    //   const result =await submitCollection.updateOne(filter,updateDoc)
    //   res.send(result)

    // })




   //submit assignment data read
   app.get('/submitassignment',async(req,res)=>{
     console.log(req.query);
    const cursor =submitCollection.find()
    const result=await cursor.toArray()
    res.send(result)
   })


  
   
    



//     //create database for submit assignment
//     const markedCollection = client.db("groupStudyDB").collection("markedassignment")

//   //assignment marked post
//   app.post('/markedassignment',async(req,res)=>{
//     const newMarkedAssignment = req.body;
//     const result = await markedCollection.insertOne(newMarkedAssignment)
//     res.send(result)
//   })
// //submit assignment data read
// app.get('/markedassignment',async(req,res)=>{
//   const cursor =markedCollection.find()
//   const result=await cursor.toArray()
//   res.send(result)
//  })
  

  








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
