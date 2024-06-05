import { describe, expect, it } from 'vitest'
import type { CaipNetworkId, NetworkControllerClient } from '../../index.js'
import { EventsController, NetworkController } from '../../index.js'

// -- Setup --------------------------------------------------------------------
const caipNetwork = { id: 'eip155:1', name: 'Ethereum' } as const
// const requestedCaipNetworks = [
//   { id: 'eip155:1', name: 'Ethereum' },
//   { id: 'eip155:42161', name: 'Arbitrum One' },
//   { id: 'eip155:43114', name: 'Avalanche C-Chain' }
// ] as CaipNetwork[]
const approvedCaipNetworkIds = ['eip155:1', 'eip155:42161'] as CaipNetworkId[]
const switchNetworkEvent = {
  type: 'track',
  event: 'SWITCH_NETWORK',
  properties: { network: caipNetwork.id }
} as const

const client: NetworkControllerClient = {
  switchCaipNetwork: async _caipNetwork => Promise.resolve(),
  getApprovedCaipNetworksData: async () =>
    Promise.resolve({ approvedCaipNetworkIds, supportsAllNetworks: false })
}

// -- Tests --------------------------------------------------------------------
describe('NetworkController', () => {
  it('should throw if client not set', () => {
    expect(NetworkController._getClient).toThrow('NetworkController client not set')
  })

  it('should have valid default state', () => {
    NetworkController.setClient(client)

    expect(NetworkController.state).toEqual({
      _client: NetworkController._getClient(),
      supportsAllNetworks: true,
      isDefaultCaipNetwork: false,
      smartAccountEnabledNetworks: []
    })
  })

  it('should update state correctly on setRequestedCaipNetworks()', () => {
    // NetworkController.setRequestedCaipNetworks(requestedCaipNetworks)
    // expect(NetworkController.state.requestedCaipNetworks).toEqual(requestedCaipNetworks)
  })

  it('should update state correctly on switchCaipNetwork()', async () => {
    await NetworkController.switchActiveNetwork(caipNetwork)
    expect(NetworkController.activeNetwork()).toEqual(caipNetwork)
    expect(EventsController.state.data).toEqual(switchNetworkEvent)
  })

  it('should update state correctly on setCaipNetwork()', () => {
    NetworkController.setCaipNetwork(caipNetwork)
    expect(NetworkController.activeNetwork()).toEqual(caipNetwork)
  })

  it('should update state correctly on getApprovedCaipNetworkIds()', async () => {
    await NetworkController.getApprovedCaipNetworksData()
    // expect(NetworkController.state.approvedCaipNetworkIds).toEqual(approvedCaipNetworkIds)
  })

  it('should reset state correctly on resetNetwork()', () => {
    NetworkController.resetNetwork()
    expect(NetworkController.activeNetwork()).toEqual(undefined)
    // expect(NetworkController.state.approvedCaipNetworkIds).toEqual(undefined)
    // expect(NetworkController.state.requestedCaipNetworks).toEqual(requestedCaipNetworks)
    expect(NetworkController.state.smartAccountEnabledNetworks).toEqual([])
  })

  it('should update state correctly on setDefaultCaipNetwork()', () => {
    NetworkController.setDefaultCaipNetwork(caipNetwork)
    expect(NetworkController.activeNetwork()).toEqual(caipNetwork)
    expect(NetworkController.state.isDefaultCaipNetwork).toEqual(true)
  })

  it('should reset state correctly when default caip network is true', () => {
    NetworkController.resetNetwork()
    expect(NetworkController.activeNetwork()).toEqual(caipNetwork)
    // expect(NetworkController.state.approvedCaipNetworkIds).toEqual(undefined)
    // expect(NetworkController.state.requestedCaipNetworks).toEqual(requestedCaipNetworks)
  })

  it('should check correctly if smart accounts are enabled on the network', () => {
    NetworkController.setSmartAccountEnabledNetworks([1])
    expect(NetworkController.checkIfSmartAccountEnabled()).toEqual(true)
    NetworkController.setSmartAccountEnabledNetworks([])
    expect(NetworkController.checkIfSmartAccountEnabled()).toEqual(false)
    NetworkController.setSmartAccountEnabledNetworks([2])
    expect(NetworkController.checkIfSmartAccountEnabled()).toEqual(false)
    NetworkController.setCaipNetwork({ id: 'eip155:2', name: 'Ethereum' })
    expect(NetworkController.checkIfSmartAccountEnabled()).toEqual(true)
  })
})
