import React, { useEffect, useState } from "react";
import "./CustomersList.css";
import axios from "axios";
import AllDetails from "../AllDetails";
import AllCustomerDetails from "../AllCustomerDetails";
import { useNavigate } from "react-router-dom";
const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [visibleInput, setVisibleInput] = useState(null);
  const [amountValue, setAmountValue] = useState("");
  const [buttonClick, setButtonClick] = useState(true);
  const [newCustomerButtonClicked, setNewCustomerButton] = useState(false);
  const [allButtonClicked, setAllButton] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [riceBrands,setRiceBrands]=useState("")
  const [sellingData,setSellingData]=useState({"sellBrand":"","sellQuantity":0,"sellPrice":0})
  const navigate=useNavigate()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/customers");
        setCustomers(response.data);
      } catch (err) {
        console.log("Error fetching customers:", err);
      }
    };
    const fetchRiceBrands=async()=>{
      try{
        const brands=await axios.get("/storage");
        setRiceBrands(brands.data)
      }catch(err){
        console.log("Error fetching customers:", err);
      }
    }
    fetchData();
    fetchRiceBrands();
    
  }, []);
  

  const handleChange=(event)=>{
    const {name,value}=event.target
    setSellingData((prevData)=>(
      {
        ...prevData,[name]:value,
    }
    ))
  }
  const handleAddButtonClick = (customerId) => {
    setButtonClick(false);
    setVisibleInput({ customerId, action: "add" });
    setAmountValue("");
  };

  const handleRemoveButtonClick = (customerId) => {
    setButtonClick(false);
    setVisibleInput({ customerId, action: "remove" });
    setAmountValue("");
  };

  const handleOkButtonClick = async (event) => {
    event.preventDefault();
    if (sellingData.sellQuantity<0 || sellingData.sellPrice < 0) {
      alert("Please enter a valid amount or quantity!");
      return;
    }
    const { customerId, action } = visibleInput;
    if(action==="add"){
      try {
        const response = await axios.put(`/updateStorage/${sellingData.sellBrand}/remove`, {
          addPackets: parseInt(sellingData.sellQuantity),
        });
        console.log("Storage updated:", response);
      } catch (err) {
        console.log("Error updating storage:", err);
        alert("Error updating storage");
        return;
      }
    
      
      try {
        if (!customerId || !action) {
          alert("Missing customer data or action.");
          return;
        }
        const url =`/addBalance/${customerId}`;    
       
        const updateResponse = await axios.put(url, {
          amount: parseInt(sellingData.sellPrice) * parseInt(sellingData.sellQuantity),
        });
        console.log("Customer balance updated:", updateResponse);
    
      
        const customersResponse = await axios.get("/customers"); 
        setCustomers(customersResponse.data);
    
      
        setVisibleInput(null);
        setAmountValue("");
      } catch (err) {
        console.error("Error updating customer balance:", err);
        alert("Error updating customer balance");
        return; 
      }
      //thirdddd taskkkk
    //calculating the profittt
    const boughtBrand=riceBrands.find(item=>item.nameofthebrand===sellingData.sellBrand)
    const boughtBrandCost=boughtBrand.costofeachpacket
    const profit=parseFloat(sellingData.sellPrice)-parseFloat(boughtBrandCost)
    const totalProfit=profit*parseFloat(sellingData.sellQuantity)
    try{
      const profitResult=await axios.put(`/profits/addProfit`,{"profit":totalProfit})
      console.log(profitResult)
    }catch(err){
      console.log("error in updating profit",err)
    }

    }else{
            
      try {
        if (!customerId || !action) {
          alert("Missing customer data or action.");
          return;
        }
        const url =`/removeBalance/${customerId}`;    
       
        const updateResponse = await axios.put(url, {
          amount: parseInt(sellingData.sellPrice),
        });
        console.log("Customer balance updated:", updateResponse);
    
      
        const customersResponse = await axios.get("/customers"); 
        setCustomers(customersResponse.data);
        
        setVisibleInput(null);
        setAmountValue("");
     
      } catch (err) {
        console.error("Error updating customer balance:", err);
        alert("Error updating customer balance");
        return; 
      }
    

    }

    
  

    setButtonClick(true);
    
  };


  const handleNewCustomerSubmit = async (newCustomer) => {
    try {
      const url = "/customers/addCustomer";
      await axios.post(url, newCustomer);
      const response = await axios.get("/customers");
      setCustomers(response.data);
      setNewCustomerButton(false); 
    } catch (err) {
      console.log("Error in Adding New Customer", err);
    }
  };

  const handleCancelNewCustomer = () => {
    setNewCustomerButton(false); 
  };

  const handleNewCustomerButton = () => {
    setNewCustomerButton(true); 
  };




  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); 
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customer.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

 
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const nameA = a.name ? a.name : ''; 
    const nameB = b.name ? b.name : ''; 

    return nameA.localeCompare(nameB);
  });
  const handleSellButtonClick=()=>{
    navigate("/sell")
  }

  return (
    <div className="customers-container">
      <div className="new-customer">
        {newCustomerButtonClicked === false && (
          <button className="newCustomerButton" onClick={handleNewCustomerButton}>
            Add New Customer
          </button>
          
        )}
        
      </div>
        <center><button className="add-button" onClick={handleSellButtonClick}>Sellll</button></center>
      <div className="allDetails">
      {allButtonClicked && <AllDetails></AllDetails>}
      {allButtonClicked && <AllCustomerDetails></AllCustomerDetails>}
      </div>
   
      {newCustomerButtonClicked && (
        <div className="new-customer-form">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNewCustomerSubmit({
                name: e.target.name.value,
                address: e.target.address.value,
              });
            }}
          >
            <input type="text" name="name" placeholder="Customer Name" required />
            <input
              type="text"
              name="address"
              placeholder="Customer Address"
              required
            />
            <button type="submit">Add Customer</button>
            <button type="button" onClick={handleCancelNewCustomer}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {newCustomerButtonClicked === false && allButtonClicked === false && (
        <div className="details">
          <h1>Customer Details</h1>

        
          <input
            type="text"
            className="search-box"
            placeholder="Search by name or address"
            value={searchQuery}
            onChange={handleSearchChange}
          />
      
          {sortedCustomers.map((item, index) => (
            <div className="customer-box" key={index}>
              <h2>{item.name}</h2>
              <p>Amount: {item.outstanding_balance}</p>
              <p>Address: {item.address}</p>
              <p>Phone: {item.phone_number}</p>
              <div className="button-container">
                {buttonClick && (
                  <div>
                    <button
                      className="add-button"
                      onClick={() => {
                        handleAddButtonClick(item.customer_id);
                      }}
                    >
                      Add Payment
                    </button>
                    <button
                      className="remove-button"
                      onClick={() => {
                        handleRemoveButtonClick(item.customer_id);
                      }}
                    >
                      Remove Payment
                    </button>
                   
                  </div>
                )}

                {visibleInput?.customerId === item.customer_id && (
                  <div>
                   <form onSubmit={handleOkButtonClick}>
                    {visibleInput["action"]==="add"&&<div>
                      <label htmlFor="options">Choose Rice Brand</label>
                    <select
                    id="options"
                    name="sellBrand"
                    required
                    value={sellingData.sellBrand}
                    onChange={handleChange}
                    >
                      <option value="" disabled>Select An Option</option>
                      {
                        riceBrands.map((item,index)=>(
                        <option key={index} value={item.nameofthebrand}>{item.nameofthebrand}({item.quantityinpackets})({item.costofeachpacket})</option>
                        ))
                      }
                      </select>
                      <label htmlFor="quantity">Enter Quantity</label>
                      <input 
                      type="number"
                      id="quantity"
                      name="sellQuantity"
                      value={riceBrands.sellQuantity}
                      onChange={handleChange}
                      required
                      ></input>  
                    </div>}
                     <label htmlFor="price">Enter Selling Price</label>
                      <input 
                      type="number"
                      id="price"
                      name="sellPrice"
                      value={riceBrands.sellPrice}
                      onChange={handleChange}
                      required
                      ></input>

                    <button type="submit">Sumbit</button>
                   </form>
                  </div>
                )
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default CustomersList;
