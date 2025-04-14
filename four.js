// **IMPORTANT Write a function that will accept an array of objects (values can be any type, arr, obj, str,num) as a parameter, and will return a new array of sum of all numeric values of Object, and if value is an Object or arr calculate the sum of it. 
const data = [
  { a: 10, b: [5, { c: 3, d: 7 }], e: "hello" },
  { x: 2, y: { z: [1, 2, 3], w: 4 }, q: "test" },
  { p: { q: { r: 6 } }, s: [2, 3, 4] }
]; 
// Output: [25, 12, 15]
let output = []
for ( let ele of data){

  let sum = 0;
  for(let key in ele){
    if(typeof ele[key] == 'object'){
      if(Array.isArray(ele[key])){
        for(let a of ele[key]){
          if(typeof a == 'number'){
            sum+=a;
          }
        }
      }else{
        for(let a in ele[key]){
          if(typeof ele[key][a] == 'number'){
            sum+=ele[key][a]
          }
        }
      }
    }else if(typeof ele[key] == 'number'){
      sum+=ele[key]
    }
  }

  output.push(sum)
} 
// Math.random().toString(36).substring(2, length+2);
console.log(output);
let output2 = 0;
function s ( value){
  if(typeof value == 'number'){
    return output2+=value;
  }else if(typeof value == 'object'){
    if(Array.isArray(value)){
      for(let a of value){
        s(a)
      }
    }else{
      for(let key in value){
        s(value[key])
      }
    }
  }
}

s({ a: 10, b: [5, { c: 3, d: 7 }], e: "hello" },)

console.log(output2)


let a = new Promise((res, rej)=>{
  setTimeout(()=>{
    res('hello')
  }, 1000)
})

let b =  'a';

try{
 let x = 1;
  x.hello()
}catch(err){
  console.log(err, 'err')
}

console.log(b, 'asfsd');
