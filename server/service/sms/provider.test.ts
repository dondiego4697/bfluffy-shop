import nock from 'nock';
import {TestContext} from 'tests/test-context';
import {SmsProvider} from '$sms/provider';
import {ClientError} from '$error/error';
import {config} from 'app/config';

describe('sms provider', () => {
    const context = new TestContext();
    const smsProvider = new SmsProvider();

    beforeAll(async () => context.beforeAll());
    afterAll(async () => context.afterAll());
    beforeEach(async () => context.beforeEach());

    
    it('should throw client error if smth was wrong', async () => {
        nock(config['sms-boom.host'])
            .get('/messages/v2/send')
            .query({
                phone: 123,
                text: 'text',
                sender: 'SOME_SENDER'
            })
            .reply(400);

        let checkError;

        try {
            await smsProvider.send(123, 'text')
        } catch (error) {
            checkError = error;
        }

        expect(checkError instanceof ClientError).toBeTruthy();
        expect(checkError.clientErrorCode).toBe('SMS_SEND_FAILED');
    });
});
