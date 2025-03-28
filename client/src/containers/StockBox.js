import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import BuyPanel from "../components/BuyPanel";
import NewsPanel from "../components/NewsPanel";
import CandleStickChart from "../components/CandleStickChart";
import { PageContainer, OverviewTitle, ExternalContainerRow, ExternalContainerColumn, InternalContainerColumn, InternalContainerRow, DisplayContainer } from "../components/SharedStyles";


// import NewsList from "../components/NewsList";

const StockBox = ({selectedStock, portfolioStocks, watchList, toggleWatchList}) => {
  console.log('toggle', toggleWatchList)

    const [livePriceData, setLivePriceData] = useState(null);
    const [liveCompanyData, setLiveCompanyData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [stockDetails, setStockDetails] = useState(null);
    const [isWatched, setIsWatched] = useState(false);
    const [ordersShowHide, setOrdersShowHide] = useState(false);


    let isOwned = false;
    
    if (portfolioStocks !== null) {
      isOwned = portfolioStocks.some(stock => stock.ticker === selectedStock);
    }


    const retrieveStockDetails = (isOwned, selectedStock, portfolioStocks) => {
      if (isOwned) {
        portfolioStocks.map(stock => {
          if (stock.ticker === selectedStock) {
            setStockDetails(stock);
          }
        })
      }
    }



    useEffect(() => {
      if (!selectedStock) {
        return; 
      }

      fetch(
        `https://finnhub.io/api/v1/quote?symbol=${selectedStock}&token=${process.env.REACT_APP_FINNHUB_API_TOKEN}`
      )
        .then((res) => res.json())
        .then((data) => setLivePriceData(data));
        setCurrentTime(new Date()); // Update currentTime after setting livePriceData
        retrieveStockDetails(isOwned, selectedStock, portfolioStocks);


    }, [selectedStock]);
  
    useEffect(() => {
      if (!selectedStock) {
        return; 
      }
      fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${selectedStock}&token=${process.env.REACT_APP_FINNHUB_API_TOKEN}`
      )
        .then((res) => res.json())
        .then((data) => setLiveCompanyData(data));
    }, [selectedStock]);

    useEffect(() => {
      console.log("watchList in StockBox", watchList);    
      if (watchList && selectedStock) {
        const selectedStockExists = watchList.some(item => item.ticker === selectedStock);
        setIsWatched(selectedStockExists);
      }
    }, [watchList, selectedStock]);
    
    useEffect(() => {
      console.log("live company data in StockBox", liveCompanyData);
    }, [liveCompanyData]);

    


    if (!liveCompanyData || !livePriceData) {
      return "Loading...";
    }
  
    const { logo } = liveCompanyData;

    const formattedDate = format(currentTime, "do MMMM yyyy, hh:mm:ss a");

    const OwnershipDetailsContainer = () => {
      if (!stockDetails) {
        return null;
      }
    
      console.log("stockDetails in StockBox", stockDetails);

      const handleShowOrders = (e) => {
        e.preventDefault();
        console.log("Show orders");
        setOrdersShowHide(!ordersShowHide);
      }

    
        return (
          <div>
            <p>You own {stockDetails.totalShares} shares of {' ' + stockDetails.ticker}</p>
            <OrderHistory>
              <Button type="submit" onClick={(e) => handleShowOrders(e)}>{ordersShowHide ? "Hide Order History" : "Show Order History"}</Button>
                {ordersShowHide && <OrderHistoryContainer>
                  {stockDetails.orders.map((order, index) => (
                    <Order key={index}>
                      <OrderItem>{order.date}</OrderItem>
                      <OrderItem>{order.pricePerShare}</OrderItem>
                      <OrderType order={order}>{order.type.toUpperCase() + ' '}({order.sharesQuantity})</OrderType>
                    </Order>
                  ))}
                </OrderHistoryContainer>}
            </OrderHistory>
          </div>
        );
    };

    const Button = styled.button`
      background-color: rgb(255, 255, 255, 0.0);
      color: black;
      padding: 5px 10px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 15px;
      border-radius: 5px;
      border: 2px solid black;
      transition-duration: 0.4s;
      cursor: pointer;
      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
      }
  `;

    const OrderHistory = styled.div`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
      margin-bottom: 20px;
      `;

    const OrderHistoryContainer = styled.div`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      padding: 10px;
      width: 100%;
      `;

    const Order = styled.div`
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      border: 2px solid black;
      border-radius: 12px;
      padding: 5px;
      margin-bottom: 5px;
      width: 100%;
      background-color: rgba(255, 255, 255, 0.5);
      `;

    const OrderType = styled.div`
      color: ${props => props.order.type === "buy" ? "#39FF14" : "red"};
      font-weight: bold;
      font-size: 12px;
      `;

    const OrderItem = styled.span`
      font-size: 12px;
      padding: 2px;
      `;

      
    

    const handleToggleWatchList = () => {
      const updatedIsWatched = toggleWatchList(selectedStock, liveCompanyData.logo);
      setIsWatched(updatedIsWatched);
    }





    return livePriceData ? ( 
        <>
        <OverviewTitle>Stock Overview</OverviewTitle>
        <PageContainer>

          <ExternalContainerRow>
            <InternalContainerRow>

              {/* <DisplayContainer> */}
              
                <DisplayContainer>
                <LogoLink href={liveCompanyData.weburl} target="_blank">
                    <Logo src={logo} alt="company logo" />
                  </LogoLink>
                  <StockTitleContainer>
                    <StockTitle>{liveCompanyData.name}</StockTitle><StockTicker>({liveCompanyData.ticker})</StockTicker>
                  </StockTitleContainer>
                  <StockTitleContainer>
                    <StockExchange>{liveCompanyData.exchange}.</StockExchange><Currency> Currency in {liveCompanyData.currency}</Currency>
                  </StockTitleContainer>
                  <StockSummaryContainer>
                    <StockCurrentPrice title="current price">
                    {livePriceData.c !== undefined ? `$${livePriceData.c.toFixed(2)}` : ''}
                    </StockCurrentPrice>
                    <StockPriceChange title="stock price change (since last close)" value={livePriceData.d}>
                      {livePriceData.d !== undefined ? `$${livePriceData.d.toFixed(2)}` : ''}
                    </StockPriceChange>
                    <PriceChangePercent value={livePriceData.dp}>
                      {livePriceData.dp !== undefined ? `(${livePriceData.dp.toFixed(2)}%)` : ''}
                    </PriceChangePercent>
                  </StockSummaryContainer>
                  <CurrentTime>As of {formattedDate}</CurrentTime>
                </DisplayContainer>
          
              {/* </DisplayContainer> */}

              <DisplayContainer>




                <DisplayContainer>
                <StyledIcon icon={faStar} onClick={handleToggleWatchList} isWatched={isWatched}/>
                <WatchListMessage>{isWatched ? "You are watching this stock (click the star to toggle the watchlist)" : "You are not watching this stock (click the star to toggle the watchlist)"}</WatchListMessage>
                  <BuyPanel currentPrice={livePriceData.c} stockName={liveCompanyData.name} stockTicker={liveCompanyData.ticker} logo={liveCompanyData.logo}/>
                </DisplayContainer>


                <DisplayContainer>
              <DetailContainer>
              <DetailKey>Market cap:</DetailKey>
                <DetailValue>
                  {liveCompanyData.marketCapitalization !== undefined ? `$${liveCompanyData.marketCapitalization.toFixed(2)}` : ''}
                </DetailValue>
              </DetailContainer>
              <DetailContainer>
                <DetailKey>Previous close:</DetailKey><DetailValue>${livePriceData.pc}</DetailValue>
              </DetailContainer>
              <DetailContainer>
                <DetailKey>Open:</DetailKey><DetailValue>${livePriceData.o}</DetailValue>
              </DetailContainer>
              <DetailContainer>
                <DetailKey>High:</DetailKey><DetailValue>${livePriceData.h}</DetailValue>
              </DetailContainer>
              <DetailContainer>
                <DetailKey>Low:</DetailKey><DetailValue>${livePriceData.l}</DetailValue>
              </DetailContainer>
            </DisplayContainer>

            <DisplayContainer>

                  {isOwned && <OwnershipDetailsContainer/>}
            </DisplayContainer>



              </DisplayContainer>



          </InternalContainerRow>
          </ExternalContainerRow>

          <ExternalContainerColumn>
          <InternalContainerColumn>
            <DisplayContainer>

            <StockChartContainer>
              <CandleStickChart stockName={liveCompanyData.name} stockTicker={liveCompanyData.ticker}></CandleStickChart>
            </StockChartContainer>

            </DisplayContainer>
          </InternalContainerColumn>
          </ExternalContainerColumn>



        <NewsPanel containerType="stock" selectedStock={selectedStock} /> 
      </PageContainer>



        </>
        
     ) : null;


};


  const WatchListMessage = styled.p`
    font-size: 10px;
    color: black;
    `;

  const StockTitleContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    height: 100%;
    width: 100%;
    margin: 0px
  `;

  const StockSummaryContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    width: 100%;
    margin-top: 10px;
    line-height: 1.5;
  `;


  const StockTitle = styled.p`
  padding: 0px;
  color: black;
  margin-right: 10px;
  margin-bottom: 0px;
  font-weight: bold;
  font-size: 20px;
  `;

  const StockTicker = styled.p`
  display: inline;
  padding: 0px;
  color: black;
  margin-bottom: 0px;
  font-weight: bold;
  font-size: 20px;
  `
  const StockExchange = styled.p`
  padding: 0px;
  color: lightgrey;
  margin-right: 10px;
  margin-bottom: 0px;
  margin-top: 0px;
  font-style: italic;
  `;

  const Currency = styled.p`
  display: inline;
  padding: 0px;
  color: lightgrey;
  margin-right: 10px;
  margin-bottom: 0px;
  margin-top: 0px;
  font-style: italic;
  `;


const Logo = styled.img`
  width: 200px;
  height: 200px;
  margin: 10px;
  padding: 10px;
  border-radius: 50%;
  `;

  const LogoLink = styled.a`
  text-decoration: none;
  `;

  const StockChartContainer = styled.div`
  width: 90%;
  height: 50%;
  margin: 10px;
  border: 1px solid black;
  box-sizing: border-box;
  align-self: center;
  `;

  const StockCurrentPrice = styled.span`
  padding: 0px;
  color: black;
  margin-right: 10px;
  margin-top: 0px;
  font-weight: bold;
  font-size: 36px;

  `
  
  const StockPriceChange = styled.span`
  padding: 0px;
  color: black;
  margin-right: 10px;
  margin-top: 0px;
  color: ${props => props.value > 0 ? "#39FF14" : "red"};
  font-weight: bold;
  `

  const PriceChangePercent = styled.span`
  padding: 0px;
  color: ${props => props.value > 0 ? "#39FF14" : "red"};
  margin-top: 0px;
  font-weight: bold;
  `
  const DetailContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 5px;
  `;

  const DetailKey = styled.span`
  padding: 0px; 
  margin-left: 20%;

  `

  const DetailValue = styled.span`
  padding: 0px;
  font-weight: bold;
  color: black;
  margin-right: 20%;
  `

  const CurrentTime = styled.p`
  font-size: 11px;
  font-style: italic;
  color: black;  
  `;

  const StyledIcon = styled(FontAwesomeIcon)`
  width: 50px;
  height: 50px;
  margin-left: 50%;
  border-radius: 50%;
  color: ${(props) => (props.isWatched ? "rgb(237, 237, 7)" : "rgb(153, 153, 255)")}
  `;

  const OrderHistory = styled.div`
  `

  /* const OwnershipDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
  width: 50%;
  margin: 10px;
  ` */







export default StockBox;