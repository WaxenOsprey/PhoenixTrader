import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import calculateProfitLoss from "../services/CalculateProfitOrLoss";
import {StockContext} from "../services/StockContext";


const StockItem = ({ stock, handleStockClick, handleCalculatedValues }) => {
  const [livePriceData, setLivePriceData] = useState(null);
  const [liveCompanyData, setLiveCompanyData] = useState(null);

  const { setCalculatedValsList } = useContext(StockContext);
  
  useEffect(() => {
    fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.ticker}&token=cim0421r01qucvvrg00gcim0421r01qucvvrg010`)
      .then((res) => res.json())
      .then((data) => setLivePriceData(data));
  }, [stock.ticker]);

  useEffect(() => {
    fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${stock.ticker}&token=cim0421r01qucvvrg00gcim0421r01qucvvrg010`
    )
      .then((res) => res.json())
      .then((data) => setLiveCompanyData(data));
  }, [stock.ticker]);

  useEffect(() => {
    if (liveCompanyData && livePriceData) {
      const calculatedVals = calculateProfitLoss(stock.orders, livePriceData.c);
      setCalculatedValsList((prevList) => [...prevList, calculatedVals]);
    }
  }, [liveCompanyData, livePriceData, stock.orders, setCalculatedValsList]);

  if (!liveCompanyData || !livePriceData) {
    return "Loading...";
  }

  const { logo } = liveCompanyData;
  const { profitLoss, isProfit, totalShares, currentTotalValue } = calculateProfitLoss(stock.orders, livePriceData.c);

  return (
    <StockItemDiv onClick={() => handleStockClick(stock.ticker)}>
      <CompanyInfo>
        <StockTicker>{stock.ticker}</StockTicker>
        <StockName>{liveCompanyData.name}</StockName>
        <StockCurrentPrice>Current price: {livePriceData.c}</StockCurrentPrice>
      </CompanyInfo>
      <Logo src={logo} alt="company logo" />
      <PerformanceInfo>
        <StockTotalShares>{totalShares.toFixed(2)} Shares</StockTotalShares>
        <StockTotalValue>Total value: {currentTotalValue.toFixed(2)}</StockTotalValue>
        <ProfitOrLoss isProfit={isProfit}>{profitLoss.toFixed(2)}</ProfitOrLoss>
      </PerformanceInfo>
    </StockItemDiv>
  );
};
  const StockItemDiv = styled.div`
    border: 5px solid black;
    margin: 10px;
    padding: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  `;
  
  const CompanyInfo = styled.div`
    width: 25%;
  `;
  
  const StockName = styled.h3`
    font-size: 20px;
  `;
  
  const StockTicker = styled.p`
    font-size: 15px;
  `;
  
  const StockTotalShares = styled.p`
    font-size: 15px;
  `;
  
  const StockCurrentPrice = styled.p`
    font-size: 15px;
  `;
  
  const StockTotalValue = styled.p``;
  
  const Logo = styled.img`
    width: 10%;
    height: 10%;
    border-radius: 50%;
  `;
  
  const PerformanceInfo = styled.div`
    width: 25%;
  `;
  
  const ProfitOrLoss = styled.p`
    color: ${(props) => (props.isProfit ? "green" : "red")};
    font-size: 20px;
    font-weight: bold;
  `;

export default StockItem;
