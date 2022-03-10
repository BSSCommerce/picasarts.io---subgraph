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

  if (functionCall.methodName == "offer") {
    const receiptId = receipt.id.toBase58()
    // Maps the JSON formatted log to the LOG entity
    let activity = new Activity(`${receiptId}`)

    // Standard receipt properties
    activity.blockTime = BigInt.fromU64(blockHeader.timestampNanosec / 1000000)
    activity.from = receipt.signerId
    // Log Parsing
    if (outcome.logs != null && outcome.logs.length > 0) {
      if(outcome.logs[0].split(':')[0] == '{"type"'){
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
                    case key == 'ft_token_id':
                      activity.token_id = paramObject.entries[m].value.toString()
                      break
                    case key == 'price':
                      activity.price = paramObject.entries[m].value.kind != JSONValueKind.NULL ? BigInt.fromString(paramObject.entries[m].value.toString()) : null
                      break
                    case key == 'owner_id':
                      activity.to = paramObject.entries[m].value.toString()
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

  if (functionCall.methodName == "accept_offer") {
    const receiptId = receipt.id.toBase58()
    // Maps the JSON formatted log to the LOG entity
    let activity = new Activity(`${receiptId}`)

    // Standard receipt properties
    activity.blockTime = BigInt.fromU64(blockHeader.timestampNanosec / 1000000)
    activity.from = receipt.signerId
    // Log Parsing
    if (outcome.logs != null && outcome.logs.length > 0) {
      if(outcome.logs[0].split(':')[0] == '{"type"'){
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
                    case key == 'ft_token_id':
                      activity.token_id = paramObject.entries[m].value.toString()
                      break
                    case key == 'price':
                      activity.price = paramObject.entries[m].value.kind != JSONValueKind.NULL ? BigInt.fromString(paramObject.entries[m].value.toString()) : null
                      break
                    case key == 'new_owner_id':
                      activity.to = paramObject.entries[m].value.toString()
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

  if (functionCall.methodName == "update_price") {
    const receiptId = receipt.id.toBase58()
    // Maps the JSON formatted log to the LOG entity
    let activity = new Activity(`${receiptId}`)

    // Standard receipt properties
    activity.blockTime = BigInt.fromU64(blockHeader.timestampNanosec / 1000000)
    activity.from = receipt.signerId
    // Log Parsing
    if (outcome.logs != null && outcome.logs.length > 0) {
      if(outcome.logs[0].split(':')[0] == '{"type"'){
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
                    case key == 'ft_token_id':
                      activity.token_id = paramObject.entries[m].value.toString()
                      break
                    case key == 'price':
                      activity.price = paramObject.entries[m].value.kind != JSONValueKind.NULL ? BigInt.fromString(paramObject.entries[m].value.toString()) : null
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