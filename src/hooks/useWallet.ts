/**
 * useWallet - Hook for managing wallet balance and localStorage persistence
 * Phase 2: Business logic extraction
 */
import { useState, useCallback } from 'react'

const WALLET_STORAGE_KEY = 'amartha_wallet_balance'
const DEFAULT_BALANCE = 1000000000

interface UseWalletReturn {
    walletBalance: number
    handleApproveLoan: (amount: number) => void
}

/**
 * Manages wallet state with localStorage persistence
 */
export const useWallet = (): UseWalletReturn => {
    // Initialize from localStorage or use default
    const [walletBalance, setWalletBalance] = useState<number>(() => {
        const savedBalance = localStorage.getItem(WALLET_STORAGE_KEY)
        return savedBalance ? parseInt(savedBalance, 10) : DEFAULT_BALANCE
    })

    /**
     * Handles loan approval by deducting amount from wallet
     * Validates amount before processing
     */
    const handleApproveLoan = useCallback((amount: number): void => {
        console.log('handleApproveLoan called with amount:', amount, 'type:', typeof amount)

        // Validation: must be a valid positive number
        if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
            console.log('Early return - invalid amount:', amount)
            return
        }

        setWalletBalance((prev) => {
            const newBalance = Math.max(0, prev - amount)
            localStorage.setItem(WALLET_STORAGE_KEY, newBalance.toString())
            console.log(`Approved loan ${amount}. New wallet balance: ${newBalance}`)
            return newBalance
        })
    }, [])

    return {
        walletBalance,
        handleApproveLoan
    }
}
