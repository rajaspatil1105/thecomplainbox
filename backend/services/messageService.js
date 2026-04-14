const mongoose = require('mongoose');

/**
 * Message Service
 * Handles MongoDB operations for complaint message threads
 */

class MessageService {
  /**
   * Get messages schema & collection
   */
  static async getMessagesCollection() {
    const db = mongoose.connection.db;
    return db.collection('complaint_messages');
  }

  /**
   * Get complaint messages thread
   * @param {UUID} complaintId - Complaint ID
   * @returns {Object} Message thread document
   */
  static async getMessages(complaintId) {
    try {
      const collection = await this.getMessagesCollection();
      
      const thread = await collection.findOne({
        complaint_id: complaintId
      });

      return thread || {
        complaint_id: complaintId,
        messages: []
      };
    } catch (error) {
      throw new Error(`Failed to retrieve messages: ${error.message}`);
    }
  }

  /**
   * Add message to thread
   * @param {UUID} complaintId - Complaint ID
   * @param {UUID} senderId - User ID of sender
   * @param {String} senderRole - Role of sender (student, committee_member, committee_head, admin, principal)
   * @param {String} message - Message content
   * @returns {Object} Updated thread
   */
  static async addMessage(complaintId, senderId, senderRole, message) {
    try {
      const collection = await this.getMessagesCollection();

      const newMessage = {
        sender_id: senderId,
        sender_role: senderRole,
        message: message,
        sent_at: new Date(),
        attachments: []
      };

      // Use upsert to create if doesn't exist, update if exists
      const result = await collection.findOneAndUpdate(
        { complaint_id: complaintId },
        {
          $push: {
            messages: newMessage
          },
          $setOnInsert: {
            complaint_id: complaintId,
            messages: [newMessage]
          }
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      );

      return result.value || {
        complaint_id: complaintId,
        messages: [newMessage]
      };
    } catch (error) {
      throw new Error(`Failed to add message: ${error.message}`);
    }
  }

  /**
   * Delete message from thread
   * @param {UUID} complaintId - Complaint ID
   * @param {Number} messageIndex - Index of message to delete
   * @returns {Boolean} Success status
   */
  static async deleteMessage(complaintId, messageIndex) {
    try {
      const collection = await this.getMessagesCollection();

      const result = await collection.findOneAndUpdate(
        { complaint_id: complaintId },
        {
          $unset: { [`messages.${messageIndex}`]: 1 }
        }
      );

      // Remove null entries left by $unset
      await collection.findOneAndUpdate(
        { complaint_id: complaintId },
        {
          $pull: { messages: null }
        }
      );

      return !!result.value;
    } catch (error) {
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  /**
   * Clear all messages for complaint
   * @param {UUID} complaintId - Complaint ID
   * @returns {Boolean} Success status
   */
  static async clearMessages(complaintId) {
    try {
      const collection = await this.getMessagesCollection();

      const result = await collection.deleteOne({
        complaint_id: complaintId
      });

      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to clear messages: ${error.message}`);
    }
  }
}

module.exports = MessageService;
