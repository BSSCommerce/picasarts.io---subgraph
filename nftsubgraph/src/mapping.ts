import { near, log, json, JSONValueKind, BigInt } from "@graphprotocol/graph-ts";
import { Activity } from "../generated/schema";
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

  const functionCall = action.toFunctionCall();

  if (functionCall.methodName == "nft_mint") {
    const receiptId = receipt.id.toBase58()
    // Maps the JSON formatted log to the LOG entity
    let activity = new Activity(`${receiptId}`)

    // Standard receipt properties
    activity.blockTime = BigInt.fromU64(blockHeader.timestampNanosec / 1000000)
    activity.type = "MINT"

    // Log Parsing
    if (outcome.logs != null && outcome.logs.length > 0) {
      if (outcome.logs[0].split(':')[0] == 'EVENT_JSON') {
        // this part is required to turn EVENT_JSON into valid JSON
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
                            activity.token_id = tokenString
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

  if (functionCall.methodName == "nft_transfer") {
    const receiptId = receipt.id.toBase58()
    // Maps the JSON formatted log to the LOG entity
    let activity = new Activity(`${receiptId}`)

    // Standard receipt properties
    activity.blockTime = BigInt.fromU64(blockHeader.timestampNanosec / 1000000)
    activity.type = "TRANSFER:GIFT"

    // Log Parsing
    if (outcome.logs != null && outcome.logs.length > 0) {
      if (outcome.logs[0].split(':')[0] == 'EVENT_JSON') {
        // this part is required to turn EVENT_JSON into valid JSON
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
                while (j < dataArray.length) {
                  let dataObject = dataArray[j].toObject()
                  for (let k = 0; k < dataObject.entries.length; k++) {
                    let key = dataObject.entries[k].key.toString()
                    switch (true) {
                      case key == 'old_owner_id':
                        activity.from = dataObject.entries[k].value.toString()
                        break
                      case key == 'new_owner_id':
                        activity.to = dataObject.entries[k].value.toString()
                        break
                      case key == 'token_ids':
                        let tokenArray = dataObject.entries[k].value.toArray()
                        let m = 0
                        while (m < tokenArray.length) {
                          let tokenString = "none"
                          if (tokenArray[m].toString().length > 0) {
                            tokenString = tokenArray[m].toString()
                            activity.token_id = tokenString
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

  if (functionCall.methodName == "nft_approve") {
    const receiptId = receipt.id.toBase58()
    // Maps the JSON formatted log to the LOG entity
    let activity = new Activity(`${receiptId}`)

    // Standard receipt properties
    activity.blockTime = BigInt.fromU64(blockHeader.timestampNanosec / 1000000)
    activity.from = receipt.signerId
    // Log Parsing
    if (outcome.logs != null && outcome.logs.length > 0) {
      if(outcome.logs[0].split(':')[0] == '{"type"' || outcome.logs[0].split(':')[0] == '{"params"'){
        let parsed = json.fromString(outcome.logs[0])
        if(parsed.kind == JSONValueKind.OBJECT){

          let entry = parsed.toObject()          
          // Standard receipt properties
          activity.blockTime = BigInt.fromU64(blockHeader.timestampNanosec/1000000)
          activity.from = receipt.signerId
          // types JSON
          // paras had some non-NEP 171 logs early on
          for(let i = 0; i < entry.entries.length; i++){
            let key = entry.entries[i].key.toString()
            switch (true) {
              case key == 'type':
                activity.type = entry.entries[i].value.toString()
                break
              case key == 'params':
                let paramObject = entry.entries[i].value.toObject()
                for(let m = 0; m < paramObject.entries.length; m++){
                  let key = paramObject.entries[m].key.toString()
                  switch (true) {
                    case key == 'token_id':
                      activity.token_id = paramObject.entries[m].value.toString()
                      break
                    case key == 'sale_conditions':
                      let saleConditions = paramObject.entries[m].value.toObject().entries[0]
                      activity.ft_token_id = saleConditions.key ? saleConditions.key.toString() : null
                      activity.price = saleConditions.value.kind != JSONValueKind.NULL ? BigInt.fromString(saleConditions.value.toString()) : null
                      break
                  }
                }
            }
          }
        }
        activity.save()
      }
    }

  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }
}