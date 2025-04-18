
let arr = [
  {
      "_id": "67fe418a28fd76d233d41781",
      "title": "hansss",
      "priority": "low",
      "status": "PENDING",
      "userId": {
          "role": "USER",
          "_id": "67fe3fcb099d6ba04ee0c9fd",
          "name": "Rohit HNS",
          "email": "rohit@og.com",
          "password": "123",
          "createdAt": "2025-04-15T11:15:23.383Z",
          "updatedAt": "2025-04-15T11:15:23.383Z"
      },
      "createdAt": "2025-04-15T11:22:50.235Z",
      "updatedAt": "2025-04-16T11:34:25.031Z"
  },
  {
      "_id": "67ff8c8426662752f6197e02",
      "title": "first todo",
      "priority": "high",
      "status": "PENDING",
      "userId": {
          "role": "USER",
          "_id": "67fe3fcb099d6ba04ee0c9fd",
          "name": "Rohit HNS",
          "email": "rohit@og.com",
          "password": "123",
          "createdAt": "2025-04-15T11:15:23.383Z",
          "updatedAt": "2025-04-15T11:15:23.383Z"
      },
      "createdAt": "2025-04-16T10:55:00.071Z",
      "updatedAt": "2025-04-16T10:55:00.071Z"
  },
  {
      "_id": "6800a5ae3d6d5bd57a06e876",
      "title": "second todo ",
      "priority": "high",
      "status": "PENDING",
      "userId": {
          "_id": "67fcb09057a6b8f9f3d78152",
          "name": "anmol",
          "email": "anmol@vp.com",
          "password": "1234",
          "createdAt": "2025-04-14T06:52:00.616Z",
          "updatedAt": "2025-04-14T06:52:00.616Z",
          "__v": 0,
          "role": "ADMIN"
      },
      "createdAt": "2025-04-17T06:54:38.650Z",
      "updatedAt": "2025-04-17T06:54:38.650Z"
  }
]

let obj = {
  "_id": "67fe418a28fd76d233d41781",
  "title": "hansss",
  "priority": "low",
  "status": "PENDING",

  "userId": {
      "role": "USER",
      "_id": "67fe3fcb099d6ba04ee0c9fd",
      "name": "Rohit HNS",
      "email": "rohit@og.com",
      "password": "123",
      "createdAt": "2025-04-15T11:15:23.383Z",
      "updatedAt": "2025-04-15T11:15:23.383Z"
  },
  "createdAt": "2025-04-15T11:22:50.235Z",
  "updatedAt": "2025-04-16T11:34:25.031Z",
}


function fn(obj){
  let newOjb = {
    ...obj,
    name: obj.userId.name,
    email: obj.userId.email
  }
  delete newOjb.userId
 return newOjb
}
// let arr2 = []
// for(let obj of arr){
//   arr2.push(fn(obj));
// }
// console.log(arr2, 'changed')
  // return {
  //   "_id": "67fe418a28fd76d233d41781",
  //   "title": "hansss",
  //   "priority": "low",
  //   "status": "PENDING",
  //   "name": "Rohit HNS",
  //   "email": "rohit@og.com",
  //   "userId": {
  //       "role": "USER",
  //       "_id": "67fe3fcb099d6ba04ee0c9fd",
  //       "name": "Rohit HNS",
  //       "email": "rohit@og.com",
  //       "password": "123",
  //       "createdAt": "2025-04-15T11:15:23.383Z",
  //       "updatedAt": "2025-04-15T11:15:23.383Z"
  //   },
  //   "createdAt": "2025-04-15T11:22:50.235Z",
  //   "updatedAt": "2025-04-16T11:34:25.031Z",
  // }
// }



// console.log(fn(obj), 'new obj')
// obj ={...obj, new2 : obj._id, new3 :'static'}
// obj['new2'] = obj._id;
// obj['new3'] = 'static';
// console.log(obj);
// let key = '_id';


// obj[key] = obj['new1'];
// obj['new2'] = obj[key];



// let arr2 = []
// for(let obj of arr){
//   let newOjb = {
//     ...obj,
//     name: obj.userId.name,
//     email: obj.userId.email
//   }
//   delete newOjb.userId
//   arr2.push(newOjb);
// }
// console.log(arr2, 'changed')

// let arr2 = arr.map((obj)=>{
//   let newOjb = {
//         ...obj,
//         name: obj.userId.name,
//         email: obj.userId.email
//       }
//       delete newOjb.userId
//       return newOjb
// })

// let arr2 = [];
// console.log(arr, 'before')

// for(let i=0; i<arr.length; i++){
//   let obj = arr[i];
//   let newOjb = {
//         ...obj,
//         name: obj.userId.name,
//         email: obj.userId.email
//       }
//       delete newOjb.userId
//       // arr2.push(newOjb);
//       arr[i] = newOjb
// }

// console.log(arr, 'changed')

// let arr3 = arr.reduce((acc, obj)=>{
//   let newOjb = {
//             ...obj,
//             name: obj.userId.name,
//             email: obj.userId.email
//           }
//           delete newOjb.userId
//           return [...acc, newOjb]
// }, [])
// console.log(arr3, 'changed2')
