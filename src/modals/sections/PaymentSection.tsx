/* eslint-disable react-native/no-inline-styles */
import { TouchableOpacity, View, Text } from 'react-native';
import Keypad from '../../components/keyPad';

export const PaymentSection = ({
  colors,
  parcelTotal,
  setIsSplitPayment,
  isSplitPayment,
  setActiveField,
  setPaymentMethod,
  paymentMethod,
  setMpesaPortion,
  activeField,
  phoneNumber,
  mpesaPortion,
  amountGiven,
  paymentTotals,
  handleKeypadChange,
}: any) => {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
      }}
    >
      {/* HEADER */}

      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 16,
        }}
      >
        Payment
      </Text>

      {/* TOTAL */}

      <View
        style={{
          backgroundColor: colors.background,
          padding: 20,
          borderRadius: 16,
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            color: colors.text,
          }}
        >
          TOTAL DUE
        </Text>

        <Text
          style={{
            color: colors.primary,
            fontSize: 34,
            fontWeight: 'bold',
          }}
        >
          KES {Number(parcelTotal || 0).toLocaleString()}
        </Text>
      </View>

      {/* SPLIT PAYMENT */}
{/* 
      <TouchableOpacity
        onPress={() => {
          const next = !isSplitPayment;

          setIsSplitPayment(next);

          if (next) {
            setPaymentMethod('MPESA');

            setMpesaPortion(parcelTotal.toString());

            setActiveField('MPESA_AMT');
          } else {
            setPaymentMethod('CASH');

            setMpesaPortion('');

            setActiveField('CASH_AMT');
          }
        }}
        style={{
          borderWidth: 1,
          borderColor: isSplitPayment
            ? colors.primary
            : colors.border,
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontWeight: '600',
          }}
        >
          Split Cash & M-Pesa
        </Text>
      </TouchableOpacity> */}

      {/* PAYMENT METHODS */}

      {!isSplitPayment && (
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.background,
            padding: 4,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          {/* CASH */}

          <TouchableOpacity
            onPress={() => {
              setIsSplitPayment(false);

              setPaymentMethod('CASH');

              setMpesaPortion('');

              setActiveField('CASH_AMT');
            }}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 10,
              backgroundColor:
                paymentMethod === 'CASH'
                  ? '#3b82f6'
                  : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color:
                  paymentMethod === 'CASH'
                    ? '#fff'
                    : colors.text,
                fontWeight: 'bold',
              }}
            >
              CASH
            </Text>
          </TouchableOpacity>

          {/* MPESA */}

          <TouchableOpacity
            onPress={() => {
              setIsSplitPayment(false);

              setPaymentMethod('MPESA');

              setMpesaPortion(parcelTotal.toString());

              setActiveField('PHONE');
            }}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 10,
              backgroundColor:
                paymentMethod === 'MPESA'
                  ? '#22c55e'
                  : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color:
                  paymentMethod === 'MPESA'
                    ? '#fff'
                    : colors.text,
                fontWeight: 'bold',
              }}
            >
              M-PESA
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MPESA SECTION */}

      {(paymentMethod === 'MPESA' || isSplitPayment) && (
        <>
          {/* PHONE */}

          <TouchableOpacity
            onPress={() => setActiveField('PHONE')}
            style={{
              borderWidth: 2,
              borderColor:
                activeField === 'PHONE'
                  ? colors.primary
                  : colors.border,
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: colors.text,
              }}
            >
              +254 {phoneNumber || '7XXXXXXXX'}
            </Text>
          </TouchableOpacity>

          {/* MPESA AMOUNT */}

          {isSplitPayment && (
            <TouchableOpacity
              onPress={() => setActiveField('MPESA_AMT')}
              style={{
                borderWidth: 2,
                borderColor:
                  activeField === 'MPESA_AMT'
                    ? colors.primary
                    : colors.border,
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                }}
              >
                M-PESA: KES {mpesaPortion || '0'}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* CASH SECTION */}

      {(paymentMethod === 'CASH' || isSplitPayment) && (
        <TouchableOpacity
          onPress={() => setActiveField('CASH_AMT')}
          style={{
            borderWidth: 2,
            borderColor:
              activeField === 'CASH_AMT'
                ? colors.primary
                : colors.border,
            padding: 16,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: colors.text,
            }}
          >
            CASH: KES {amountGiven || '0'}
          </Text>
        </TouchableOpacity>
      )}

      {/* CHANGE */}

      {paymentTotals.change > 0 && (
        <View
          style={{
            marginTop: 16,
            backgroundColor: '#f97316',
            padding: 16,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontWeight: 'bold',
            }}
          >
            CHANGE: KES {paymentTotals.change.toFixed(2)}
          </Text>
        </View>
      )}

      {/* KEYPAD */}

      <Keypad
        value={
          activeField === 'PHONE'
            ? phoneNumber
            : activeField === 'MPESA_AMT'
            ? mpesaPortion
            : amountGiven
        }
        defaultValue=""
        onChange={handleKeypadChange}
      />
    </View>
  );
};