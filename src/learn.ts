let age: number = 20;
let karanuAge: number = 20;
let username: string = "karanu";
let karanuUsername: string = "karanu";
let isStudent: boolean = true;
let karanuIsStudent: boolean = true;

const product: {
    readonly id: number;
  name: string;
  price: number;
  description?: {
    city: string;
    country: string;
  };
} = {
    id:1,
  name: "Oscar",
  price: 20,
  description: {
    city: "Nairobi",
    country: "Kenya"
  }
};


function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}
const calculateTotalArrow = (price: number, quantity: number): number => {
  return price * quantity;
};

interface Vehicle {
  brand: string;
  year: number;
}

interface Car extends Vehicle {
  doors: number;
}

const car: Car = {
  brand: "OscarG3",
  year: 2030,
  doors: 4
};