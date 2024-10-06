from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json

def extract_recession_indicator():
    url = "https://en.macromicro.me/charts/7898/mm-global-economic-recession-rate"

    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Set up the Chrome WebDriver
    service = Service('path/to/chromedriver')  # Replace with your chromedriver path
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        print(f"Navigating to {url}")
        driver.get(url)

        # Wait for the chart to load
        print("Waiting for chart to load...")
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "chart"))
        )

        # Give some extra time for the chart to fully render
        time.sleep(5)

        # Execute JavaScript to get the chart data
        print("Extracting chart data...")
        chart_data = driver.execute_script("""
            var chart = Highcharts.charts[0];
            if (chart && chart.series && chart.series[0] && chart.series[0].data) {
                var data = chart.series[0].data;
                return data.map(function(point) {
                    return {
                        date: Highcharts.dateFormat('%Y-%m-%d', point.x),
                        value: point.y
                    };
                });
            }
            return null;
        """)

        if chart_data:
            print("Successfully extracted chart data")
            latest_data = chart_data[-1]
            return latest_data
        else:
            print("Failed to extract chart data")
            return None

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

    finally:
        driver.quit()

if __name__ == "__main__":
    print("Starting extraction process")
    result = extract_recession_indicator()
    if result:
        print(f"Latest Global Recession Indicator:")
        print(f"Date: {result['date']}")
        print(f"Value: {result['value']}")
    else:
        print("Failed to extract data.")

    print("Script execution completed")