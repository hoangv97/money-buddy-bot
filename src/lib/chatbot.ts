import { addRow, getRows } from '@/lib/googlesheet';
import { sendMessage, sendQuickReply } from '@/lib/messenger';

export const processMessage = async (requestData: any) => {
  // send back a response// extract sender's ID
  const senderId = requestData.entry[0].messaging[0].sender.id;

  try {
    // extract the message
    const message = requestData.entry[0].messaging[0].message.text;

    // analyze the message, use regex to get data by format: content cost_in_number (can be k)
    const regex = /(.+) (\d+k?)/;
    const match = message.match(regex);
    const content = match[1];
    let cost = match[2];

    // replace k in cost with 000
    cost = cost.replace('k', '000');

    // check if cost is a number
    const costNumber = Number(cost);
    if (isNaN(costNumber)) {
      await sendMessage(senderId, 'Please enter a valid number');
      return;
    }

    // console.log('match', content, cost);
    const now = new Date().toISOString();

    // save to google sheet
    const response = await addRow({
      Sender: senderId,
      Content: content,
      Cost: cost,
      Time: now,
    });
    return response;
  } catch (error) {
    // console.log(JSON.stringify(requestData, null, 2));

    // try to get payload
    const payload =
      requestData.entry[0].messaging[0].message?.quick_reply?.payload;

    if (payload === 'OPEN_SHEET') {
      await sendMessage(
        senderId,
        `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_DOC_ID}/edit?usp=sharing`
      );
      return;
    }
    if (payload === 'MONTHLY_EXPENSE') {
      const rows = await getRows();
      const thisMonthRows = rows.filter((row) => {
        const rowDate = new Date(row.get('Time'));
        const now = new Date();
        return (
          // senderId === row.get('Sender') &&
          rowDate.getMonth() === now.getMonth() &&
          rowDate.getFullYear() === now.getFullYear()
        );
      });
      const totalCost = thisMonthRows.reduce(
        (total, row) => total + Number(row.get('Cost')),
        0
      );

      await sendMessage(senderId, `Your monthly expense is ${totalCost}.`);
      return;
    }

    await sendQuickReply(senderId, 'Menu:', [
      {
        content_type: 'text',
        title: 'Open Sheet',
        payload: 'OPEN_SHEET',
      },
      {
        content_type: 'text',
        title: 'Monthly expense',
        payload: 'MONTHLY_EXPENSE',
      },
    ]);
  }
};
