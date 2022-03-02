import { near, log, json, JSONValueKind, BigInt } from "@graphprotocol/graph-ts";
import { Account, Log, Activity } from "../generated/schema";
import { MINT, TRANSFER, BURN, SALE, LISTING, OFFER } from "./activityTypes";
export function handleReceipt(receipt: near.ReceiptWithOutcome): void {
  const actions = receipt.receipt.actions;

  for (let i = 0; i < actions.length; i++) {
    handleAction(
      actions[i],
      receipt.receipt,
      receipt.block.header,
      receipt.outcome
    );
  }
}

function handleAction(
  action: near.ActionValue,
  receipt: near.ActionReceipt,
  blockHeader: near.BlockHeader,
  outcome: near.ExecutionOutcome
): void {
  if (action.kind != near.ActionKind.FUNCTION_CALL) {
    log.info("Early return: {}", ["Not a function call"])
    return
  }

  let accounts = new Account(receipt.signerId);
  const functionCall = action.toFunctionCall();

  // change the methodName here to the methodName emitting the log in the contract
  if (functionCall.methodName == "putDID") {
    const receiptId = receipt.id.toHexString();
    accounts.signerId = receipt.signerId;

    // Maps the JSON formatted log to the LOG entity
    let logs = new Log(`${receiptId}`);
    if (outcome.logs[0] != null) {
      logs.id = receipt.signerId;

      let parsed = json.fromString(outcome.logs[0])
      if (parsed.kind == JSONValueKind.OBJECT) {

        let entry = parsed.toObject()

        //EVENT_JSON
        let eventJSON = entry.entries[0].value.toObject()

        //standard, version, event (these stay the same for a NEP 171 emmitted log)
        for (let i = 0; i < eventJSON.entries.length; i++) {
          let key = eventJSON.entries[i].key.toString()
          switch (true) {
            case key == 'standard':
              logs.standard = eventJSON.entries[i].value.toString()
              break
            case key == 'event':
              logs.event = eventJSON.entries[i].value.toString()
              break
            case key == 'version':
              logs.version = eventJSON.entries[i].value.toString()
              break
          }
        }

        //data
        let data = eventJSON.entries[0].value.toObject()
        for (let i = 0; i < data.entries.length; i++) {
          let key = data.entries[i].key.toString()
          // Replace each key with the key of the data your are emitting,
          // Ensure you add the keys to the Log entity and that the types are correct
          switch (true) {
            case key == 'accountId':
              logs.accountId = data.entries[i].value.toString()
              break
            case key == 'did':
              logs.did = data.entries[i].value.toString()
              break
            case key == 'registered':
              logs.registered = data.entries[i].value.toBigInt()
              break
            case key == 'owner':
              logs.owner = data.entries[i].value.toString()
              break
          }
        }

      }
      logs.save()
    }

    accounts.log.push(logs.id);

  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

  // change the methodName here to the methodName emitting the log in the contract
  if (functionCall.methodName == "new") {
    const receiptId = receipt.id.toHexString();
    accounts.signerId = receipt.signerId;

    let logs = new Log(`${receiptId}`);
    if (outcome.logs[0] != null) {
      logs.id = receipt.signerId;

      let parsed = json.fromString(outcome.logs[0])
      if (parsed.kind == JSONValueKind.OBJECT) {

        let entry = parsed.toObject()

        //EVENT_JSON
        let eventJSON = entry.entries[0].value.toObject()

        //standard, version, event (these stay the same for a NEP 171 emmitted log)
        for (let i = 0; i < eventJSON.entries.length; i++) {
          let key = eventJSON.entries[i].key.toString()
          switch (true) {
            case key == 'standard':
              logs.standard = eventJSON.entries[i].value.toString()
              break
            case key == 'event':
              logs.event = eventJSON.entries[i].value.toString()
              break
            case key == 'version':
              logs.version = eventJSON.entries[i].value.toString()
              break
          }
        }

        //data
        let data = eventJSON.entries[0].value.toObject()
        for (let i = 0; i < data.entries.length; i++) {
          let key = data.entries[i].key.toString()

          // Replace each key with the key of the data your are emitting,
          // Ensure you add the keys to the Log entity and that the types are correct
          switch (true) {
            case key == 'adminId':
              logs.adminId = data.entries[i].value.toString()
              break
            case key == 'accountId':
              logs.accountId = data.entries[i].value.toString()
              break
            case key == 'adminSet':
              logs.adminSet = data.entries[i].value.toBigInt()
              break
          }
        }

      }
      logs.save()
    }

    accounts.log.push(logs.id);
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

  if (functionCall.methodName == "nft_mint") {
    const receiptId = receipt.id.toBase58()
    // Maps the JSON formatted log to the LOG entity
    let activity = new Activity(`${receiptId}`)

    // Standard receipt properties
    activity.blockTime = BigInt.fromU64(blockHeader.timestampNanosec / 1000000)
    // Standard receipt properties
    activity.type = MINT
    // Log Parsing
    if (outcome.logs != null && outcome.logs.length > 0) {

      if (outcome.logs[0].split(':')[0] == 'EVENT_JSON') {

        // this part is required to turn the paras contract EVENT_JSON into valid JSON
        let delimiter = ':'
        let parts = outcome.logs[0].split(delimiter)
        parts[0] = '"EVENT_JSON"'
        let newString = parts.join(delimiter)
        let formatString = '{' + newString + '}'
        let parsed = json.fromString(formatString)


        if (parsed.kind == JSONValueKind.OBJECT) {
          let entry = parsed.toObject()

          //EVENT_JSON
          let eventJSON = entry.entries[0].value.toObject()

          //standard, version, event (these stay the same for a NEP 171 emmitted log)
          for (let i = 0; i < eventJSON.entries.length; i++) {
            let key = eventJSON.entries[i].key.toString()
            switch (true) {
              case key == 'data':
                let j = 0
                let dataArray = eventJSON.entries[i].value.toArray()
                log.info("Data array: {}", [dataArray.toString()]);
                while (j < dataArray.length) {
                  let dataObject = dataArray[j].toObject()
                  for (let k = 0; k < dataObject.entries.length; k++) {
                    let key = dataObject.entries[k].key.toString()
                    switch (true) {
                      case key == 'owner_id':
                        activity.from = dataObject.entries[k].value.toString()
                        break
                      case key == 'token_ids':
                        let tokenArray = dataObject.entries[k].value.toArray()
                        let m = 0
                        while (m < tokenArray.length) {
                          let tokenString = "none"
                          if (tokenArray[m].toString().length > 0) {
                            tokenString = tokenArray[m].toString()
                          }
                          m++
                        }
                        break
                    }
                  }
                  j++
                }
                break
            }
          }
        }
        activity.save()
      }
    }
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }
  accounts.save();
}