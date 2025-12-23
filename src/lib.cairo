// SPDX-License-Identifier: MIT
#[starknet::contract]
pub mod Kinun1155 {
    use core::byte_array::ByteArray;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc1155::{ERC1155Component, ERC1155HooksEmptyImpl};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::ContractAddress;

    const TOKEN_ID: u256 = u256 { low: 1, high: 0 };

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // Ownable Mixin
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // ERC1155 Mixin
    #[abi(embed_v0)]
    impl ERC1155MixinImpl = ERC1155Component::ERC1155MixinImpl<ContractState>;
    impl ERC1155InternalImpl = ERC1155Component::InternalImpl<ContractState>;
    impl ERC1155HooksDefaultImpl = ERC1155HooksEmptyImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        pub erc1155: ERC1155Component::Storage,
        #[substorage(v0)]
        pub src5: SRC5Component::Storage,
        pub total_minted: u256,
        pub max_supply: u256,
        pub mint_enabled: bool,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        ERC1155Event: ERC1155Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    #[starknet::interface]
    trait IKinun1155<TContractState> {
        fn mint(ref self: TContractState, to: ContractAddress, amount: u256);
        fn set_base_uri(ref self: TContractState, base_uri: ByteArray);
        fn set_mint_enabled(ref self: TContractState, enabled: bool);
        fn total_minted(self: @TContractState) -> u256;
        fn max_supply(self: @TContractState) -> u256;
        fn mint_enabled(self: @TContractState) -> bool;
    }

    #[constructor]
    fn constructor(ref self: ContractState, base_uri: ByteArray, owner: ContractAddress) {
        self.ownable.initializer(owner);
        self.erc1155.initializer(base_uri);
        self.total_minted.write(u256 { low: 0, high: 0 });
        self.max_supply.write(u256 { low: 10000, high: 0 });
        self.mint_enabled.write(true);
    }

    #[abi(embed_v0)]
    impl KinunExternalImpl of IKinun1155<ContractState> {
        fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            assert(self.mint_enabled.read(), 'MINT_DISABLED');

            let total = self.total_minted.read();
            let max = self.max_supply.read();
            let next = total + amount;
            assert(next <= max, 'MAX_SUPPLY');

            self.total_minted.write(next);
            self.erc1155.mint_with_acceptance_check(to, TOKEN_ID, amount, array![].span());
        }

        fn set_base_uri(ref self: ContractState, base_uri: ByteArray) {
            self.ownable.assert_only_owner();
            self.erc1155._set_base_uri(base_uri);
        }

        fn set_mint_enabled(ref self: ContractState, enabled: bool) {
            self.ownable.assert_only_owner();
            self.mint_enabled.write(enabled);
        }

        fn total_minted(self: @ContractState) -> u256 {
            self.total_minted.read()
        }

        fn max_supply(self: @ContractState) -> u256 {
            self.max_supply.read()
        }

        fn mint_enabled(self: @ContractState) -> bool {
            self.mint_enabled.read()
        }
    }

    #[external(v0)]
    fn token_id(self: @ContractState) -> u256 {
        TOKEN_ID
    }
}
