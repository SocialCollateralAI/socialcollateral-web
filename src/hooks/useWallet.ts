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


        // Validation: must be a valid positive number
        if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {

            return
        }

        setWalletBalance((prev) => {
            const newBalance = Math.max(0, prev - amount)
            localStorage.setItem(WALLET_STORAGE_KEY, newBalance.toString())

            return newBalance
        })
    }, [])

    return {
        walletBalance,
        handleApproveLoan
    }
}
