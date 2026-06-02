use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets
use cardano/transaction.{InlineDatum, Output, OutputReference, Transaction}
use types.{AttendeeMetadata, BurnTokens, ReferenceAction, UpdateMetadata}

fn get_tier_rank(tier: ByteArray) -> Int {
  if tier == "Newcomer" {
    1
  } else if tier == "Regular" {
    2
  } else if tier == "OG" {
    3
  } else if tier == "Legend" {
    4
  } else {
    0
  }
}

validator cip68_reference(organiser_pkh: VerificationKeyHash) {
  spend(
    datum_opt: Option<AttendeeMetadata>,
    redeemer: ReferenceAction,
    utxo: OutputReference,
    self: Transaction,
  ) {
    let is_organiser_signed = list.has(self.extra_signatories, organiser_pkh)

    when redeemer is {
      UpdateMetadata { new_metadata } -> {
        expect Some(datum) = datum_opt
        expect is_organiser_signed

        // 1. Immutable fields check
        expect new_metadata.attendee_number == datum.attendee_number
        expect new_metadata.edition == datum.edition
        expect new_metadata.event_name == datum.event_name

        // 2. Version increment
        expect new_metadata.version == datum.version + 1

        // 3. Tier rank non-decreasing
        let old_rank = get_tier_rank(datum.tier)
        let new_rank = get_tier_rank(new_metadata.tier)
        expect new_rank >= old_rank

        // 4. Attended count non-decreasing
        expect new_metadata.attended_count >= datum.attended_count

        // 5. Reference token re-output to the same script address
        let own_output =
          self.inputs
            |> transaction.resolve_input(utxo)

        let script_address = own_output.address

        // Check if there is an output to the same script address containing the same asset
        // and the new_metadata as inline datum
        list.any(
          self.outputs,
          fn(out) {
            let Output { address, value, datum: out_datum, .. } = out
            address == script_address && assets.match_assets(
              value,
              own_output.value,
            ) && when out_datum is {
              InlineDatum(datum_data) -> {
                expect output_metadata: AttendeeMetadata = datum_data
                output_metadata == new_metadata
              }
              _ -> False
            }
          },
        )
      }
      BurnTokens -> is_organiser_signed
    }
  }

  else(_) {
    fail
  }
}
