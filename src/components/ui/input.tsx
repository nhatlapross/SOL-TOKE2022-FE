//hookswap-frontend\src\components\ui\input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    label, 
    helperText, 
    leftIcon, 
    rightIcon, 
    loading, 
    disabled,
    ...props 
  }, ref) => {
    const inputId = React.useId();
    const isDisabled = disabled || loading;
    
    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium mb-2 transition-colors",
              error ? "text-red-400" : "text-white/80",
              isDisabled && "text-white/50"
            )}
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          {/* Input Field */}
          <input
            id={inputId}
            type={type}
            className={cn(
              // Base styles
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm transition-all duration-200",
              "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              
              // Icon padding
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              
              // State styles
              error ? [
                "border-red-500/50 bg-red-500/10 text-white",
                "focus-visible:ring-red-500 focus-visible:border-red-500"
              ] : [
                "border-input bg-white/10 text-white",
                "focus-visible:ring-primary focus-visible:border-primary/50",
                "hover:border-primary/30"
              ],
              
              // Disabled styles
              isDisabled && [
                "cursor-not-allowed opacity-50",
                "hover:border-input"
              ],
              
              // Loading styles
              loading && "animate-pulse",
              
              className
            )}
            disabled={isDisabled}
            ref={ref}
            {...props}
          />
          
          {/* Right Icon / Loading Spinner */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white/60" />
            ) : rightIcon ? (
              <div className="text-white/60">{rightIcon}</div>
            ) : null}
          </div>
        </div>
        
        {/* Helper Text / Error Message */}
        {(helperText || error) && (
          <div className="mt-1.5 text-xs">
            {error ? (
              <span className="text-red-400 flex items-center gap-1">
                <svg 
                  className="w-3 h-3" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
                {error}
              </span>
            ) : (
              <span className="text-white/60">{helperText}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Specialized Input Variants
const NumberInput = React.forwardRef<HTMLInputElement, InputProps & {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}>(({ precision = 6, ...props }, ref) => {
  return (
    <Input
      type="number"
      step={props.step || `0.${'0'.repeat(precision - 1)}1`}
      {...props}
      ref={ref}
    />
  )
})
NumberInput.displayName = "NumberInput"

const TokenAmountInput = React.forwardRef<HTMLInputElement, InputProps & {
  tokenSymbol?: string;
  balance?: string;
  onMaxClick?: () => void;
}>(({ tokenSymbol, balance, onMaxClick, ...props }, ref) => {
  return (
    <div className="space-y-2">
      <Input
        type="number"
        step="0.000001"
        min="0"
        rightIcon={
          onMaxClick ? (
            <button
              type="button"
              onClick={onMaxClick}
              className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-2 py-1 rounded transition-colors"
            >
              MAX
            </button>
          ) : tokenSymbol ? (
            <span className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded">
              {tokenSymbol}
            </span>
          ) : null
        }
        {...props}
        ref={ref}
      />
      {balance && (
        <div className="text-xs text-white/60">
          Balance: {balance} {tokenSymbol}
        </div>
      )}
    </div>
  )
})
TokenAmountInput.displayName = "TokenAmountInput"

const AddressInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const [isValid, setIsValid] = React.useState<boolean | null>(null);
    
    const validateAddress = React.useCallback((value: string) => {
      if (!value) {
        setIsValid(null);
        return;
      }
      
      // Simple Solana address validation (44 characters, base58)
      const isValidFormat = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
      setIsValid(isValidFormat);
    }, []);
    
    React.useEffect(() => {
      if (props.value) {
        validateAddress(props.value as string);
      }
    }, [props.value, validateAddress]);
    
    return (
      <Input
        placeholder="Enter Solana address..."
        rightIcon={
          isValid === true ? (
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : isValid === false ? (
            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : null
        }
        error={isValid === false ? "Invalid Solana address format" : props.error}
        onChange={(e) => {
          validateAddress(e.target.value);
          props.onChange?.(e);
        }}
        {...props}
        ref={ref}
      />
    )
  }
)
AddressInput.displayName = "AddressInput"

const SearchInput = React.forwardRef<HTMLInputElement, InputProps & {
  onClear?: () => void;
}>(({ onClear, ...props }, ref) => {
  const [hasValue, setHasValue] = React.useState(false);
  
  React.useEffect(() => {
    setHasValue(Boolean(props.value));
  }, [props.value]);
  
  return (
    <Input
      type="search"
      leftIcon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      rightIcon={hasValue && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="text-white/60 hover:text-white/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ) : null}
      {...props}
      ref={ref}
    />
  )
})
SearchInput.displayName = "SearchInput"

export { 
  Input, 
  NumberInput, 
  TokenAmountInput, 
  AddressInput, 
  SearchInput 
}