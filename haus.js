
'use strict';
const shim = require('fabric-shim');
const util = require('util');

/************************************************************************************************
 * 
 * GENERAL FUNCTIONS 
 * 
 ************************************************************************************************/

/**
 * Executes a query using a specific key
 * 
 * @param {*} key - the key to use in the query
 */
async function queryByKey(stub, key) {
  console.log('============= START : queryByKey ===========');
  console.log('##### queryByKey key: ' + key);

  let resultAsBytes = await stub.getState(key); 
  if (!resultAsBytes || resultAsBytes.toString().length <= 0) {
    throw new Error('##### queryByKey key: ' + key + ' does not exist');
  }
  console.log('##### queryByKey response: ' + resultAsBytes);
  console.log('============= END : queryByKey ===========');
  return resultAsBytes;
}

/**
 * Executes a query based on a provided queryString
 * 
 * I originally wrote this function to handle rich queries via CouchDB, but subsequently needed
 * to support LevelDB range queries where CouchDB was not available.
 * 
 * @param {*} queryString - the query string to execute
 */
async function queryByString(stub, queryString) {
  console.log('============= START : queryByString ===========');
  console.log("##### queryByString queryString: " + queryString);

  // CouchDB Query
  // let iterator = await stub.getQueryResult(queryString);

  // Equivalent LevelDB Query. We need to parse queryString to determine what is being queried
  // In this chaincode, all queries will either query ALL records for a specific docType, or
  // they will filter ALL the records looking for a specific NGO, Donor, Donation, etc. So far, 
  // in this chaincode there is a maximum of one filter parameter in addition to the docType.
  let docType = "";
  let startKey = "";
  let endKey = "";
  let jsonQueryString = JSON.parse(queryString);
  if (jsonQueryString['selector'] && jsonQueryString['selector']['docType']) {
    docType = jsonQueryString['selector']['docType'];
    startKey = docType + "0";
    endKey = docType + "z";
  }
  else {
    throw new Error('##### queryByString - Cannot call queryByString without a docType element: ' + queryString);   
  }

  let iterator = await stub.getStateByRange(startKey, endKey);

  // Iterator handling is identical for both CouchDB and LevelDB result sets, with the 
  // exception of the filter handling in the commented section below
  let allResults = [];
  while (true) {
    let res = await iterator.next();

    if (res.value && res.value.value.toString()) {
      let jsonRes = {};
      console.log('##### queryByString iterator: ' + res.value.value.toString('utf8'));

      jsonRes.Key = res.value.key;
      try {
        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
      } 
      catch (err) {
        console.log('##### queryByString error: ' + err);
        jsonRes.Record = res.value.value.toString('utf8');
      }
      // ******************* LevelDB filter handling ******************************************
      // LevelDB: additional code required to filter out records we don't need
      // Check that each filter condition in jsonQueryString can be found in the iterator json
      // If we are using CouchDB, this isn't required as rich query supports selectors
      let jsonRecord = jsonQueryString['selector'];
      // If there is only a docType, no need to filter, just return all
      console.log('##### queryByString jsonRecord - number of JSON keys: ' + Object.keys(jsonRecord).length);
      if (Object.keys(jsonRecord).length == 1) {
        allResults.push(jsonRes);
        continue;
      }
      for (var key in jsonRecord) {
        if (jsonRecord.hasOwnProperty(key)) {
          console.log('##### queryByString jsonRecord key: ' + key + " value: " + jsonRecord[key]);
          if (key == "docType") {
            continue;
          }
          console.log('##### queryByString json iterator has key: ' + jsonRes.Record[key]);
          if (!(jsonRes.Record[key] && jsonRes.Record[key] == jsonRecord[key])) {
            // we do not want this record as it does not match the filter criteria
            continue;
          }
          allResults.push(jsonRes);
        }
      }
      // ******************* End LevelDB filter handling ******************************************
      // For CouchDB, push all results
      // allResults.push(jsonRes);
    }
    if (res.done) {
      await iterator.close();
      console.log('##### queryByString all results: ' + JSON.stringify(allResults));
      console.log('============= END : queryByString ===========');
      return Buffer.from(JSON.stringify(allResults));
    }
  }
}

async function queryByZeeString(stub, queryString) {
  console.log('============= START : queryByString ===========');
  console.log("##### queryByString queryString: " + queryString);

  // CouchDB Query
  // let iterator = await stub.getQueryResult(queryString);

  // Equivalent LevelDB Query. We need to parse queryString to determine what is being queried
  // In this chaincode, all queries will either query ALL records for a specific docType, or
  // they will filter ALL the records looking for a specific NGO, Donor, Donation, etc. So far, 
  // in this chaincode there is a maximum of one filter parameter in addition to the docType.
  let docType = "";
  let startKey = "";
  let endKey = "";
  let jsonQueryString = JSON.parse(queryString);
  if (jsonQueryString['selector'] && jsonQueryString['selector']['docType']) {
    docType = jsonQueryString['selector']['docType'];
    startKey = docType + "0";
    endKey = docType + "999999";
  }
  else {
    throw new Error('##### queryByString - Cannot call queryByString without a docType element: ' + queryString);   
  }

  let iterator = await stub.getStateByRange(startKey, endKey);

  // Iterator handling is identical for both CouchDB and LevelDB result sets, with the 
  // exception of the filter handling in the commented section below
  let allResults = [];
  while (true) {
    let res = await iterator.next();

    if (res.value && res.value.value.toString()) {
      let jsonRes = {};
      console.log('##### queryByString iterator: ' + res.value.value.toString('utf8'));

      jsonRes.Key = res.value.key;
      try {
        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
      } 
      catch (err) {
        console.log('##### queryByString error: ' + err);
        jsonRes.Record = res.value.value.toString('utf8');
      }
      // ******************* LevelDB filter handling ******************************************
      // LevelDB: additional code required to filter out records we don't need
      // Check that each filter condition in jsonQueryString can be found in the iterator json
      // If we are using CouchDB, this isn't required as rich query supports selectors
      let jsonRecord = jsonQueryString['selector'];
      // If there is only a docType, no need to filter, just return all
      console.log('##### queryByString jsonRecord - number of JSON keys: ' + Object.keys(jsonRecord).length);
      if (Object.keys(jsonRecord).length == 1) {
        allResults.push(jsonRes);
        continue;
      }
      for (var key in jsonRecord) {
        if (jsonRecord.hasOwnProperty(key)) {
          console.log('##### queryByString jsonRecord key: ' + key + " value: " + jsonRecord[key]);
          if (key == "docType") {
            continue;
          }
          console.log('##### queryByString json iterator has key: ' + jsonRes.Record[key]);
          if (!(jsonRes.Record[key] && jsonRes.Record[key] == jsonRecord[key])) {
            // we do not want this record as it does not match the filter criteria
            continue;
          }
          allResults.push(jsonRes);
        }
      }
      // ******************* End LevelDB filter handling ******************************************
      // For CouchDB, push all results
      // allResults.push(jsonRes);
    }
    if (res.done) {
      await iterator.close();
      console.log('##### queryByString all results: ' + JSON.stringify(allResults));
      console.log('============= END : queryByString ===========');
      return Buffer.from(JSON.stringify(allResults));
    }
  }
}



/************************************************************************************************
 * 
 * CHAINCODE
 * 
 ************************************************************************************************/

let Chaincode = class {

  /**
   * Initialize the state when the chaincode is either instantiated or upgraded
   * 
   * @param {*} stub 
   */
  async Init(stub) {
    console.log('=========== Init: Instantiated / Upgraded ngo chaincode ===========');
    return shim.success();
  }

  /**
   * The Invoke method will call the methods below based on the method name passed by the calling
   * program.
   * 
   * @param {*} stub 
   */
  async Invoke(stub) {
    console.log('============= START : Invoke ===========');
    let ret = stub.getFunctionAndParameters();
    console.log('##### Invoke args: ' + JSON.stringify(ret));

    let method = this[ret.fcn];
    if (!method) {
      console.error('##### Invoke - error: no chaincode function with name: ' + ret.fcn + ' found');
      throw new Error('No chaincode function with name: ' + ret.fcn + ' found');
    }
    try {
      let response = await method(stub, ret.params);
      console.log('##### Invoke response payload: ' + response);
      return shim.success(response);
    } catch (err) {
      console.log('##### Invoke - error: ' + err);
      return shim.error(err);
    }
  }

  /**
   * Initialize the state. This should be explicitly called if required.
   * 
   * @param {*} stub 
   * @param {*} args 
   */
  async initLedger(stub, args) {
    console.log('============= START : Initialize Ledger ===========');
    console.log('============= END : Initialize Ledger ===========');
  }



  /************************************************************************************************
   * 
   * Voting User functions 
   * 
   ************************************************************************************************/
   /**
   * Creates a new Voting User
   * 
   * @param {*} stub 
   * @param {*} args - JSON as follows:
   * {
   *        "id"=>systemID,
   *        "voting_user_id"=>systemID,
   *        "contact_id"=>systemID,
   *        "public_key"=>systemID,
   *        "wallet_type"=>systemID,
   *        "user_email"=>systemID,
   *        "voting_event_id"=>systemID,
   *        "voting_zeh_balance"=>systemID,
   *        "vote_time"=>systemID,
   *        "vote1_answer"=>systemID,
   *        "vote2_answer"=>systemID,
   *        "created_at"=>systemID,
   *        "updated_at"=>systemID
   * }
   *
   */

  async createVotingUser(stub, args) {
      console.log('============= START : createDonor ===========');
      console.log('##### createVotingUser arguments: ' + JSON.stringify(args));
  
      // args is passed as a JSON string
      let json = JSON.parse(args);
      let key = 'VotingUser' + json['id'];
      json['docType'] = 'VotingUser';
  
      console.log('##### createVotingUser payload: ' + JSON.stringify(json));
  
      // Check if the donor already exists
      let donorQuery = await stub.getState(key);
      if (donorQuery.toString()) {
        throw new Error('##### createVotingUser - This VotingUser already exists: ' + json['voting_user_id']);
      }
  
      await stub.putState(key, Buffer.from(JSON.stringify(json)));
      console.log('============= END : createVotingUser ===========');
    }

  /**
   * Retrieves a specfic VotingUser
   * 
   * @param {*} stub 
   * @param {*} args 
   */

  async queryVotingUser(stub, args) {
    console.log('============= START : queryVotingUser ===========');
    console.log('##### queryVotingUser arguments: ' + JSON.stringify(args));

    // args is passed as a JSON string
    let json = JSON.parse(args);
    let key = json['voting_user_id'];
    console.log('##### queryVotingUser key: ' + key);

    return queryByKey(stub, key);
  }
  
    /**
   * Retrieves all VotingUser
   * 
   * @param {*} stub 
   * @param {*} args 
   */
     async queryAllVotingUser(stub, args) {
      console.log('============= START : queryAllVotingUser ===========');
      console.log('##### queryAllVotingUser arguments: ' + JSON.stringify(args));
   
      let queryString = '{"selector": {"docType": "VotingUser"}}';
      return queryByZeeString(stub, queryString);
    }
  
  /************************************************************************************************
   * 
   * END Voting User functions 
   * 
   ************************************************************************************************/
  
  /************************************************************************************************
   * 
   * Voting Events functions 
   * 
   ************************************************************************************************/
   /**
   * Creates a new Voting Events
   * 
   * @param {*} stub 
   * @param {*} args - JSON as follows:
   * 
   * {
   *   "id"=>nil,
   *   "voting_event_id"=>nil,
   *   "zeh_token_sale_id"=>nil,
   *   "voting_start_date"=>nil,
   *   "voting_duration"=>nil,
   *   "voting_end_date"=>nil,
   *   "cumulative_voting_zeh_balance"=>nil,
   *   "old_zeh_balance"=>nil,
   *   "additional_zeh_coins"=>nil,
   *   "new_zeh_balance"=>nil,
   *   "old_zeh_coin_redemption_price"=>nil,
   *   "new_zeh_coin_redemption_price"=>nil,
   *   "total_voting_count"=>nil,
   *   "vote1_yes_zeh_balance"=>nil,
   *   "vote1_yes_count"=>nil,
   *   "vote1_no_zeh_balance"=>nil,
   *   "vote1_no_count"=>nil,
   *   "vote1_invalid_zeh_balance"=>nil,
   *   "vote1_invalid_count"=>nil,
   *   "vote2_yes_zeh_balance"=>nil,
   *   "vote2_yes_count"=>nil,
   *   "vote2_no_zeh_balance"=>nil,
   *   "vote2_no_count"=>nil,
   *   "vote2_invalid_zeh_balance"=>nil,
   *   "vote2_invalid_count"=>nil,
   *   "threshold1_result"=>nil,
   *   "threshold2_result"=>nil,
   *   "threshold3_result"=>nil,
   *   "vote1_final_result"=>nil,
   *   "vote2_final_result"=>nil,
   *   "created_at"=>nil,
   *   "updated_at"=>nil
   * }
   *
   */

    async createVotingEvent(stub, args) {
      console.log('============= START : createDonor ===========');
      console.log('##### createVotingEvent arguments: ' + JSON.stringify(args));
  
      // args is passed as a JSON string
      let json = JSON.parse(args);
      let key = 'VotingEvent' + json['id'];
      json['docType'] = 'VotingEvent';
  
      console.log('##### createVotingEvent payload: ' + JSON.stringify(json));
  
      // Check if the donor already exists
      let donorQuery = await stub.getState(key);
      if (donorQuery.toString()) {
        throw new Error('##### createVotingEvent - This VotingEvent already exists: ' + json['voting_event_id']);
      }
  
      await stub.putState(key, Buffer.from(JSON.stringify(json)));
      console.log('============= END : createVotingEvent ===========');
    }

  /**
   * Retrieves a specfic VotingEvent
   * 
   * @param {*} stub 
   * @param {*} args 
   */

  async queryVotingEvent(stub, args) {
    console.log('============= START : queryVotingEvent ===========');
    console.log('##### queryVotingEvent arguments: ' + JSON.stringify(args));

    // args is passed as a JSON string
    let json = JSON.parse(args);
    let key = json['voting_event_id'];
    console.log('##### queryVotingEvent key: ' + key);

    return queryByKey(stub, key);
  }
  
    /**
   * Retrieves all VotingEvent
   * 
   * @param {*} stub 
   * @param {*} args 
   */
  async queryAllVotingEvent(stub, args) {
      console.log('============= START : queryAllVotingEvent ===========');
      console.log('##### queryAllVotingEvent arguments: ' + JSON.stringify(args));
   
      let queryString = '{"selector": {"docType": "VotingEvent"}}';
      return queryByZeeString(stub, queryString);
    }
  
  /************************************************************************************************
   * 
   * END Voting Events functions 
   * 
   ************************************************************************************************/
  
    /************************************************************************************************
   * 
   * Zeh Token Sale functions 
   * 
   ************************************************************************************************/
   /**
   * Creates a new Zeh Token Sale
   * 
   * @param {*} stub 
   * @param {*} args - JSON as follows:
   * 
   * {
   *  "id"=>"nil",
   *   "zeh_token_sale_id"=>"nil",
   *   "selling_platform"=>"nil",
   *   "zeh_sale_start_date"=>"nil",
   *   "zeh_sale_end_date"=>"nil",
   *   "sale_amount"=>"nil",
   *   "zeh_coins_sold"=>"nil",
   *   "total_fees"=>"nil",
   *   "net_proceeds"=>"nil",
   *   "average_sale_price_per_zeh"=>"nil",
   *   "outstanding_zeh_balance"=>"nil",
   *   "zeh_coin_redemption_price"=>"nil",
   *   "calculated_by_smart_contract"=>"nil",
   *   "refund_start_date"=>"nil",
   *   "refund_end_date"=>"nil",
   *   "refund_coin_received_count"=>"nil",
   *   "refund_coin_received_total"=>"nil",
   *   "refund_coin_processed_count"=>"nil",
   *   "refund_coin_processed_total"=>"nil",
   *   "created_at"=>"nil",
   *   "updated_at"=>"nil"
   * }
   *
   */

    async createZehTokenSale(stub, args) {
      console.log('============= START : createDonor ===========');
      console.log('##### createZehTokenSale arguments: ' + JSON.stringify(args));
  
      // args is passed as a JSON string
      let json = JSON.parse(args);
      let key = 'ZehTokenSale' + json['id'];
      json['docType'] = 'ZehTokenSale';
  
      console.log('##### createZehTokenSale payload: ' + JSON.stringify(json));
  
      // Check if the donor already exists
      let donorQuery = await stub.getState(key);
      if (donorQuery.toString()) {
        throw new Error('##### createZehTokenSale - This ZehTokenSale already exists: ' + json['zeh_token_sale_id']);
      }
  
      await stub.putState(key, Buffer.from(JSON.stringify(json)));
      console.log('============= END : createZehTokenSale ===========');
    }

  /**
   * Retrieves a specfic ZehTokenSale
   * 
   * @param {*} stub 
   * @param {*} args 
   */

  async queryZehTokenSale(stub, args) {
    console.log('============= START : queryZehTokenSale ===========');
    console.log('##### queryZehTokenSale arguments: ' + JSON.stringify(args));

    // args is passed as a JSON string
    let json = JSON.parse(args);
    let key = json['zeh_token_sale_id'];
    console.log('##### queryZehTokenSale key: ' + key);

    return queryByKey(stub, key);
  }
  
    /**
   * Retrieves all ZehTokenSale
   * 
   * @param {*} stub 
   * @param {*} args 
   */
     async queryAllZehTokenSale(stub, args) {
      console.log('============= START : queryAllZehTokenSale ===========');
      console.log('##### queryAllZehTokenSale arguments: ' + JSON.stringify(args));
   
      let queryString = '{"selector": {"docType": "ZehTokenSale"}}';
      return queryByZeeString(stub, queryString);
    }
  
  /************************************************************************************************
   * 
   * END Zeh Token Sale functions 
   * 
  ************************************************************************************************
  /************************************************************************************************
   * 
   * Token Sale Buyer functions 
   * 
   ************************************************************************************************/
   /**
   * Creates a new Token Sale Buyer
   * 
   * @param {*} stub 
   * @param {*} args - JSON as follows:
   * 
   * {
   *   "id"=>"nil",
   *   "token_buyer_transaction_id"=>"nil",
   *   "full_name"=>"nil",
   *   "email"=>"nil",
   *   "public_key"=>"nil",
   *   "wallet_type"=>"nil",
   *   "token_purchased"=>"nil",
   *   "purchase_date"=>"nil",
   *   "purchase_amount"=>"nil",
   *   "payment_method"=>"nil",
   *   "selling_platform"=>"nil",
   *   "token_sale_id"=>"nil",
   *   "zeh_sale_end_date"=>"nil",
   *   "refund_zeh_count"=>"nil",
   *   "refund_request_date"=>"nil",
   *   "refund_status"=>"""not started",
   *   "expected_refund_in_usd"=>"nil",
   *   "refund_coin_recieved"=>"nil",
   *   "last_refund_coin_received_date"=>"nil",
   *   "refund_completion_date"=>"nil",
   *   "refunded_amount_usd"=>"nil",
   *   "refunded_token_amount"=>"nil",
   *   "created_at"=>"nil",
   *   "updated_at"=>"nil"
   * }
   *
   */

    async createTokenSaleBuyer(stub, args) {
      console.log('============= START : createTokenSale ===========');
      console.log('##### createTokenSaleBuyer arguments: ' + JSON.stringify(args));
  
      // args is passed as a JSON string
      let json = JSON.parse(args);
      let key = 'TokenSaleBuyer' + json['id'];
      json['docType'] = 'TokenSaleBuyer';
  
      console.log('##### createTokenSaleBuyer payload: ' + JSON.stringify(json));
  
      // Check if the donor already exists
      let donorQuery = await stub.getState(key);
      if (donorQuery.toString()) {
        throw new Error('##### createTokenSaleBuyer - This TokenSaleBuyer already exists: ' + json['token_sale_buyer_id']);
      }
  
      await stub.putState(key, Buffer.from(JSON.stringify(json)));
      console.log('============= END : createTokenSaleBuyer ===========');
    }

  /**
   * Retrieves a specfic TokenSaleBuyer
   * 
   * @param {*} stub 
   * @param {*} args 
   */

  async queryTokenSaleBuyer(stub, args) {
    console.log('============= START : queryTokenSaleBuyer ===========');
    console.log('##### queryTokenSaleBuyer arguments: ' + JSON.stringify(args));

    // args is passed as a JSON string
    let json = JSON.parse(args);
    let key = json['token_sale_buyer_id'];
    console.log('##### queryTokenSaleBuyer key: ' + key);

    return queryByKey(stub, key);
  }
  
    /**
   * Retrieves all TokenSaleBuyer
   * 
   * @param {*} stub 
   * @param {*} args 
   */
     async queryAllTokenSaleBuyer(stub, args) {
      console.log('============= START : queryAllTokenSaleBuyer ===========');
      console.log('##### queryAllTokenSaleBuyer arguments: ' + JSON.stringify(args));
   
      let queryString = '{"selector": {"docType": "TokenSaleBuyer"}}';
      return queryByZeeString(stub, queryString);
    }
  
  /************************************************************************************************
   * 
   * END Token Sale Buyer functions 
   * 
   ************************************************************************************************/
  
  /************************************************************************************************
   * 
   * Dao Metric functions 
   * 
   ************************************************************************************************/
   /**
   * Creates a new Dao Metric
   * 
   * @param {*} stub 
   * @param {*} args - JSON as follows:
   * 
   * {
   *   "id"=>"nil",
   *   "dao_metric_id=>"nil",
   *   "invested_value"=>"nil",
   *   "treasury_funds"=>"nil",
   *   "zeh_coin_supply"=>"nil",
   *   "zeh_coin_redemption_price"=>"nil",
   *   "market_cap"=>"nil",
   *   "coins_exchanged"=>"nil",
   *   "amount_exchanged"=>"nil",
   *   "all_time_high"=>"nil",
   *   "zeh_exchange_rate"=>"nil",
   *   "last_refresh_time"=>"nil",
   *   "created_at"=>"nil",
   *   "updated_at"=>"nil"
   * }
   *
   */

    async createDaoMetric(stub, args) {
      console.log('============= START : createDaoMetric ===========');
      console.log('##### createDaoMetric arguments: ' + JSON.stringify(args));
  
      // args is passed as a JSON string
      let json = JSON.parse(args);
      let key = 'DaoMetric' + json['id'];
      json['docType'] = 'DaoMetric';
  
      console.log('##### createDaoMetric payload: ' + JSON.stringify(json));
  
      // Check if the donor already exists
      let donorQuery = await stub.getState(key);
      if (donorQuery.toString()) {
        throw new Error('##### createDaoMetric - This DaoMetric already exists: ' + json['dao_metric_id']);
      }
  
      await stub.putState(key, Buffer.from(JSON.stringify(json)));
      console.log('============= END : createDaoMetric ===========');
    }

  /**
   * Retrieves a specfic DaoMetric
   * 
   * @param {*} stub 
   * @param {*} args 
   */

  async queryDaoMetric(stub, args) {
    console.log('============= START : queryDaoMetric ===========');
    console.log('##### queryDaoMetric arguments: ' + JSON.stringify(args));

    // args is passed as a JSON string
    let json = JSON.parse(args);
    let key = json['dao_metric_id'];
    console.log('##### queryDaoMetric key: ' + key);

    return queryByKey(stub, key);
  }
  
    /**
   * Retrieves all DaoMetric
   * 
   * @param {*} stub 
   * @param {*} args 
   */
     async queryAllDaoMetric(stub, args) {
      console.log('============= START : queryAllDaoMetric ===========');
      console.log('##### queryAllDaoMetric arguments: ' + JSON.stringify(args));
   
      let queryString = '{"selector": {"docType": "DaoMetric"}}';
      return queryByZeeString(stub, queryString);
    }
  
  /************************************************************************************************
   * 
   * END Dao Metric functions 
   * 
   ************************************************************************************************/
  

  /************************************************************************************************
   * 
   * Blockchain related functions 
   * 
   ************************************************************************************************/

  /**
   * Retrieves the Fabric block and transaction details for a key or an array of keys
   * 
   * @param {*} stub 
   * @param {*} args - JSON as follows:
   * [
   *    {"key": "a207aa1e124cc7cb350e9261018a9bd05fb4e0f7dcac5839bdcd0266af7e531d-1"}
   * ]
   * 
   */
   async queryHistoryForKey(stub, args) {
    console.log('============= START : queryHistoryForKey ===========');
    console.log('##### queryHistoryForKey arguments: ' + JSON.stringify(args));

    // args is passed as a JSON string
    let json = JSON.parse(args);
    let key = json['key'];
    let docType = json['docType']
    console.log('##### queryHistoryForKey key: ' + key);
    let historyIterator = await stub.getHistoryForKey(docType + key);
    console.log('##### queryHistoryForKey historyIterator: ' + util.inspect(historyIterator));
    let history = [];
    while (true) {
      let historyRecord = await historyIterator.next();
      console.log('##### queryHistoryForKey historyRecord: ' + util.inspect(historyRecord));
      if (historyRecord.value && historyRecord.value.value.toString()) {
        let jsonRes = {};
        console.log('##### queryHistoryForKey historyRecord.value.value: ' + historyRecord.value.value.toString('utf8'));
        jsonRes.TxId = historyRecord.value.tx_id;
        jsonRes.Timestamp = historyRecord.value.timestamp;
        jsonRes.IsDelete = historyRecord.value.is_delete.toString();
      try {
          jsonRes.Record = JSON.parse(historyRecord.value.value.toString('utf8'));
        } catch (err) {
          console.log('##### queryHistoryForKey error: ' + err);
          jsonRes.Record = historyRecord.value.value.toString('utf8');
        }
        console.log('##### queryHistoryForKey json: ' + util.inspect(jsonRes));
        history.push(jsonRes);
      }
      if (historyRecord.done) {
        await historyIterator.close();
        console.log('##### queryHistoryForKey all results: ' + JSON.stringify(history));
        console.log('============= END : queryHistoryForKey ===========');
        return Buffer.from(JSON.stringify(history));
      }
    }
  }
   async queryHistoryForZeeKey(stub, args) {
    console.log('============= START : queryHistoryForKey ===========');
    console.log('##### queryHistoryForKey arguments: ' + JSON.stringify(args));

    // args is passed as a JSON string
    let json = JSON.parse(args);
    let key = json['key'];
    let docType = json['docType']
    console.log('##### queryHistoryForKey key: ' + key);
    let historyIterator = await stub.getHistoryForKey(docType + key);
    console.log('##### queryHistoryForKey historyIterator: ' + util.inspect(historyIterator));
    let history = [];
    while (true) {
      let historyRecord = await historyIterator.next();
      console.log('##### queryHistoryForKey historyRecord: ' + util.inspect(historyRecord));
      if (historyRecord.value && historyRecord.value.value.toString()) {
        let jsonRes = {};
        console.log('##### queryHistoryForKey historyRecord.value.value: ' + historyRecord.value.value.toString('utf8'));
        jsonRes.TxId = historyRecord.value.tx_id;
        jsonRes.Timestamp = historyRecord.value.timestamp;
        jsonRes.IsDelete = historyRecord.value.is_delete.toString();
      try {
          jsonRes.Record = JSON.parse(historyRecord.value.value.toString('utf8'));
        } catch (err) {
          console.log('##### queryHistoryForKey error: ' + err);
          jsonRes.Record = historyRecord.value.value.toString('utf8');
        }
        console.log('##### queryHistoryForKey json: ' + util.inspect(jsonRes));
        history.push(jsonRes);
      }
      if (historyRecord.done) {
        await historyIterator.close();
        console.log('##### queryHistoryForKey all results: ' + JSON.stringify(history));
        console.log('============= END : queryHistoryForKey ===========');
        return Buffer.from(JSON.stringify(history));
      }
    }
  }
}
shim.start(new Chaincode());
