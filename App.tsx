// App.tsx

import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'

// Screens
import Auth from './components/Auth'
import Account from './components/Account'
import Map from './components/Map'
import Visualization from './components/Visualization'
import Book from './components/Book'
import Service from './components/Service'
import Payment from './components/Payment'
import FAQ from './components/Faq'
import PayHist from './components/Pay_hist'
import Dashboard from './components/Dashboard'
import EWallet from './components/EWallet'
import Reset from './components/Reset'
import Reset_Passwd from './components/Reset_passwd'
import Login_hist from './components/Login_hist'
import PaymentService from './components/PaymentService'
import PaymentBooking from './components/PaymentBooking'
import CardPayment from './components/CardPayment'
import SelectPlan from './components/selectplan';
import InstallmentsScreen from './components/Installments';
import InstallmentTracker from './components/InstallmentTracker';
import EVCharging from './components/EVCharging'
import ConfirmationPage from './components/ConfirmationPage'
const Stack = createStackNavigator()

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // 1. Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        upsertProfile(session.user)
      }
    })

    // 2. Listen for auth changes
    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        if (newSession?.user) {
          upsertProfile(newSession.user)
        }
      }
    )

    // 3. Cleanup
    return () => {
      authSubscription?.subscription.unsubscribe()
    }
  }, [])

  // Upsert to 'profiles' table
  async function upsertProfile(user: User) {
    try {
      // user_metadata should contain the username if provided during sign-up
      const username = user.user_metadata?.username ?? null

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,                      // PK in 'profiles'
          email: user.email,
          username,
          last_login: user.last_sign_in_at, // Record last login
        })

      if (error) {
        console.error('Upsert profile error:', error)
      } else {
        console.log('Profile upserted successfully.')
      }
    } catch (err) {
      console.error('Upsert profile exception:', err)
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Home screen: Account */}
        <Stack.Screen
          name="Auth"
          component={Auth}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Account"
          component={Account}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Map" component={Map} />
        <Stack.Screen
          name="Visualization"
          component={Visualization}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="Book"
          component={Book}
          initialParams={{ session }}
        />
        <Stack.Screen name="Service" component={Service} initialParams={{ session }} />
        <Stack.Screen name="Payment" component={Payment} />
        <Stack.Screen
          name="Installments"
          component={InstallmentsScreen}
          options={{ title: 'Payment Installments' }}
        />
        <Stack.Screen
          name="InstallmentTracker"
          component={InstallmentTracker}
          options={{ title: 'Track Your Installments' }}
        />

        <Stack.Screen name="faq" component={FAQ} />
        <Stack.Screen
          name="Pay_hist"
          component={PayHist}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          initialParams={{ session }}
        />
        <Stack.Screen
          name="EWallet"
          component={EWallet}
          initialParams={{ session }}
        />
        <Stack.Screen name="PaymentService" 
        component={PaymentService}
        initialParams={{ session }} />
        <Stack.Screen name="PaymentBooking" 
        component={PaymentBooking}
        initialParams={{ session }} />
        <Stack.Screen name="CardPayment" 
        component={CardPayment}
        initialParams={{ session }} />
        <Stack.Screen name="EVCharging" 
        component={EVCharging}
        initialParams={{ session }} />
        <Stack.Screen name="ConfirmationPage" 
        component={ConfirmationPage}
        initialParams={{ session }} />
        <Stack.Screen name='reset' component={Reset} />
        <Stack.Screen name='ResetPassword' component={Reset_Passwd} />
        <Stack.Screen name='LoginHistory' component={Login_hist} />
      </Stack.Navigator>

    </NavigationContainer>
  )
  
}
