import SingletonRouter, { Router } from 'next/router';
import { useEffect } from 'react';
import { timeDiffSec, timeDiffMin, timestamp } from '../../utils/timeUtils';
import { post_activityLog } from '/pages/api/logs/docActivity';

const defaultConfirmationDialog = async msg => window.confirm(msg);

export const useLeavePageConfirmation = (shouldPreventLeaving, activityLog, message = '사이트에서 나가시겠습니까?\n변경사항이 저장되지 않을 수 있습니다.', confirmationDialog = defaultConfirmationDialog) => {
	useEffect(() => {
		if (!SingletonRouter.router?.change) {
			console.log('...', activityLog);

			return;
		}

		const originalChangeFunction = SingletonRouter.router.change;
		const originalOnBeforeUnloadFunction = window.onbeforeunload;

		/*
		 * Modifying the window.onbeforeunload event stops the browser tab/window from
		 * being closed or refreshed. Since it is not possible to alter the close or reload
		 * alert message, an empty string is passed to trigger the alert and avoid confusion
		 * about the option to modify the message.
		 */
		if (shouldPreventLeaving) {
			// console.log('그곳에 들어옴....B', activityLog)
			window.onbeforeunload = () => '';
		} else {
			window.onbeforeunload = originalOnBeforeUnloadFunction;
		}

		/*
		 * Overriding the router.change function blocks Next.js route navigations
		 * and disables the browser's back and forward buttons. This opens up the
		 * possibility to use the window.confirm alert instead.
		 */
		if (shouldPreventLeaving) {
			console.log('...', activityLog);

			SingletonRouter.router.change = async (...args) => {
				console.log('그곳에 들어옴....');

				const [historyMethod, , as] = args;
				const currentUrl = SingletonRouter.router?.state.asPath.split('?')[0];
				const changedUrl = as.split('?')[0];
				const hasNavigatedAwayFromPage = currentUrl !== changedUrl;
				const wasBackOrForwardBrowserButtonClicked = historyMethod === 'replaceState';
				let confirmed = false;

				if (hasNavigatedAwayFromPage) {
					console.log('...A', activityLog);
					let saveLog = { ...activityLog, ...{ endTime: timestamp(), duration: timeDiffSec(activityLog.startTime, timestamp()), durationMin: timeDiffMin(activityLog.startTime, timestamp()) } };
					post_activityLog(saveLog);

					confirmed = await confirmationDialog(message);
				}

				if (confirmed) {
					// console.log('....3', activityLog)

					Router.prototype.change.apply(SingletonRouter.router, args);
				} else if (wasBackOrForwardBrowserButtonClicked && hasNavigatedAwayFromPage) {
					// console.log('....4', activityLog)

					/*
					 * The URL changes even if the user clicks "false" to navigate away from the page.
					 * It is necessary to update it to reflect the current URL.
					 */
					await SingletonRouter.router?.push(SingletonRouter.router?.state.asPath);

					/*
					 * @todo
					 *   I attempted to determine if the user clicked the forward or back button on the browser,
					 *   but was unable to find a solution after several hours of effort. As a result, I temporarily
					 *   hardcoded it to assume the back button was clicked, since that is the most common scenario.
					 *   However, this may cause issues with the URL if the forward button is actually clicked.
					 *   I hope that a solution can be found in the future.
					 */
					const browserDirection = 'back';

					browserDirection === 'back'
						? history.go(1) // back button
						: history.go(-1); // forward button
				}
			};
		}

		/*
		 * When the component is unmounted, the original change function is assigned back.
		 */
		return () => {
			SingletonRouter.router.change = originalChangeFunction;
			window.onbeforeunload = originalOnBeforeUnloadFunction;
		};
	}, [shouldPreventLeaving, activityLog, message, confirmationDialog]);
};

export default function Alert() {}
