import { useContext } from "react";
import BalanceContext from "./BalanceContext";

function Balance() {
  const balance = useContext(BalanceContext);

  return <p>Balance: ${balance}</p>;
}

export default Balance;