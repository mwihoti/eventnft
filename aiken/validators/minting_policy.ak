use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/primitive/bytearray
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use types.{BurnAttendance, MintAction, MintAttendance}

validator minting_policy(organiser_pkh: VerificationKeyHash, max_supply: Int) {
  mint(redeemer: MintAction, policy_id: PolicyId, self: Transaction) {
    let is_organiser_signed = list.has(self.extra_signatories, organiser_pkh)

    when redeemer is {
      MintAttendance { attendee_number } -> {
        // Must be signed by organiser
        expect is_organiser_signed

        // Attendee number within bounds
        expect attendee_number > 0 && attendee_number <= max_supply

        let minted_assets =
          self.mint
            |> assets.tokens(policy_id)
            |> dict.to_pairs()

        // Expect exactly 2 assets: (100) and (222) for the same attendee
        // CIP-68 prefixes:
        // (100) = 000643b0
        // (222) = 000de140
        // We'll check if both exist with quantity 1
        let has_reference =
          list.any(
            minted_assets,
            fn(asset) {
              let Pair(name, qty) = asset
              qty == 1 && bytearray.take(name, 4) == #[0, 6, 67, 176]
            },
          )
        let has_user_token =
          list.any(
            minted_assets,
            fn(asset) {
              let Pair(name, qty) = asset
              qty == 1 && bytearray.take(name, 4) == #[0, 13, 225, 64]
            },
          )

        has_reference && has_user_token && list.length(minted_assets) == 2
      }
      BurnAttendance -> is_organiser_signed
    }
  }

  else(_) {
    fail
  }
}
