export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      runs: {
        Row: {
          id: string
          name: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          user_id?: string
        }
      }
      characters: {
        Row: {
          id: string
          run_id: string
          name: string
          status: 'alive' | 'dead' | 'unknown'
        }
        Insert: {
          id?: string
          run_id: string
          name: string
          status?: 'alive' | 'dead' | 'unknown'
        }
        Update: {
          id?: string
          run_id?: string
          name?: string
          status?: 'alive' | 'dead' | 'unknown'
        }
      }
      decisions: {
        Row: {
          id: string
          run_id: string
          chapter: number
          butterfly_effect_name: string
          chosen_option: string
          timestamp: string
        }
        Insert: {
          id?: string
          run_id: string
          chapter: number
          butterfly_effect_name: string
          chosen_option: string
          timestamp?: string
        }
        Update: {
          id?: string
          run_id?: string
          chapter?: number
          butterfly_effect_name?: string
          chosen_option?: string
          timestamp?: string
        }
      }
    }
  }
}
