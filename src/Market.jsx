function Market({ name, price, change }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Price: {price}</p>
      <p>Change: {change}%</p>
    </div>
  );
}

export default Market;