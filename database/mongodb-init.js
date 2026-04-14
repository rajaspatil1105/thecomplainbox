/**
 * MongoDB Schemas for The Complain Box v2.0
 * Collections for AI outputs and complaint messages
 */

// Create AI Outputs Collection
db.createCollection('ai_outputs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: [
        'complaint_id',
        'category',
        'severity',
        'urgency_score',
        'suggested_committee',
        'is_potential_duplicate',
        'confidence',
        'summary',
        'processed_at'
      ],
      properties: {
        _id: { bsonType: 'objectId' },
        complaint_id: {
          bsonType: 'string',
          description: 'UUID - references MySQL complaints.complaint_id'
        },
        gemini_raw: {
          bsonType: 'object',
          description: 'Full raw JSON object from Gemini API'
        },
        category: {
          bsonType: 'string',
          enum: [
            'security',
            'ragging',
            'academic',
            'hostel',
            'fees',
            'infrastructure',
            'harassment',
            'other'
          ]
        },
        severity: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high', 'critical']
        },
        urgency_score: {
          bsonType: 'double',
          minimum: 0,
          maximum: 1
        },
        suggested_committee: { bsonType: 'string' },
        is_potential_duplicate: { bsonType: 'bool' },
        confidence: {
          bsonType: 'double',
          minimum: 0,
          maximum: 1
        },
        summary: {
          bsonType: 'string',
          description: 'Max 20 words'
        },
        tfidf_similarity_score: {
          bsonType: ['double', 'null'],
          minimum: 0,
          maximum: 1
        },
        ocr_extracted_text: {
          bsonType: ['string', 'null']
        },
        processed_at: { bsonType: 'date' }
      }
    }
  }
});

// Create unique index on complaint_id
db.ai_outputs.createIndex({
  complaint_id: 1
}, {
  unique: true
});

// Create Complaint Messages Collection
db.createCollection('complaint_messages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['complaint_id', 'messages'],
      properties: {
        _id: { bsonType: 'objectId' },
        complaint_id: {
          bsonType: 'string',
          description: 'UUID - references MySQL complaints.complaint_id'
        },
        messages: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['sender_id', 'sender_role', 'message', 'sent_at'],
            properties: {
              sender_id: {
                bsonType: ['string', 'null'],
                description: 'UUID or null for anonymous student'
              },
              sender_role: {
                bsonType: 'string',
                enum: ['student', 'authority']
              },
              message: { bsonType: 'string' },
              sent_at: { bsonType: 'date' },
              attachments: {
                bsonType: 'array',
                items: { bsonType: 'object' }
              }
            }
          }
        }
      }
    }
  }
});

// Create index on complaint_id for messages
db.complaint_messages.createIndex({
  complaint_id: 1
});

console.log('✓ MongoDB collections created successfully');
