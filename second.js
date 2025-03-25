function a(){
console.log('a');
return 1;
}

// a();
// let result = a()
// console.log( result);


function checkPrime(num, fn){
  if(num<2){
    fn(false, num)
    return false;
  }
  for(let i=2;i<num;i++){
    if(num%i==0){
      fn(false, num)
      return false;
    }
  }
  fn(true, num);
  return true;
}
let fn = (a, b)=>{
  if(a==true){
    console.log(b)
  }

  
  console.log('result from callback', a, b)
}
(checkPrime(1,fn ))

let arr = [1,2,3,4];

function cb (ele, index)
{
  console.log(ele, index, 'db')
  return index;

}

let forE = arr.forEach(cb
)

let mapE = arr.map(cb);

let filterE = arr.filter(cb)

console.log(filterE);

let obj = {
  a: 1,
  b : 2
}

let obj2 = {
  c:3
}

console.log(Object.keys(obj));
console.log(Object.values(obj));
console.log(Object.assign(obj,obj2))
console.log(obj);
console.log(obj2);

